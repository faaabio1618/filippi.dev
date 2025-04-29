---
layout: page
title: "Video: from horizontal to vertical, with object tracking"
date: 2023-11-01
tags:
  - youtube
  - video editing
  - python
  - object tracking
  - opencv2
  - ffmpeg
  - vertical video
  - video processing
  - youtube-dl
  - yt-dlp
image: "/tutorials/carrier-service-and-shopify-functions/image.png"
---

<div style="text-align:right;margin-bottom: 50px;">The Internet, 2024/06/26</div>

## Introduction

Target: cropping a horizontal video into a vertical one, following an object that moves.

To follow the object we will use a tracker, and we will keep it in the middle of the frame.

To do that we used python, OpenCV2, and ffmpeg.

(The code on GitHub is updated, with scene detection and smoother motion [link](https://github.com/faaabio1618/pyTracker))
## Download and prepare a video (optional)

To start let's say we want to take this video from YouTube:

[![Funny Parrot Video](http://img.youtube.com/vi/XPQlMmMDm-A/0.jpg)](https://www.youtube.com/watch?v=XPQlMmMDm-A "Here comes the sun")

And in particular, we want to use the first 15 seconds

To download we can use [yt-dlp](https://github.com/yt-dlp/yt-dlp)

```bash
$ yt-dlp https://www.youtube.com/watch?v=XPQlMmMDm-A -f "bestvideo/best"  --merge-output-format webm -o "XPQlMmMDm-A.webm"
```

We are downloading the video in the best quality available and in the webm format (which is in fact a wrapper of vp9).

We are not downloading the audio, as is not relevant for this tutorial.

### Cutting the video

We want to use the first 15 seconds. We can use ffmpeg to cut the video.

```bash
$ ffmpeg -i "XPQlMmMDm-A.webm" -ss 00:00:00 -to 00:00:15 "XPQlMmMDm-A-cut.mp4"
```

Here we are not just cutting the video, we are also converting in the same codec (vp9).

If you want to avoid this first encoding (which is not a big deal, as it's basically lossless, just time-consuming), you
can use this command

```bash
$ ffmpeg -i "XPQlMmMDm-A.webm" -ss 00:00:00 -to 00:00:15  -avoid_negative_ts 1 -c copy "XPQlMmMDm-A-cut.mp4"
```

This will cut the video without re-encoding it (`-c copy`), but it will cut the video using the key frames that are
closer to the
desired time (`-avoid_negative_ts 1`). It's faster but less precise.

### Result

And this is the extracted video:

<center>
<video src="/tutorials/vertical-video-from-youtube/XPQlMmMDm-A-cut.mp4" controls="controls" style="max-width: 730px; text-align: center;margin: 20px 0 20px 0">
</video>
</center>

## Coding the object tracker

We will use python, and OpenCV2 to track the object. I'm not an expert of trackers, and I've found them less smart than
I thought. But they are still useful.

### Choosing the tracker

OpenCV2 offers a variety of
trackers, [In this article you can find a comparison](https://broutonlab.com/blog/opencv-object-tracking/)

I've chosen the `TrackerCSRT` because it's the most accurate, especially if you know that the object is always in the
frame.

Let's start with the code

### Initialization

*This is not the full code, to see the full code you can check
the [GitHub repository](https://github.com/faaabio1618/pyTracker).*

```python
def main():
    arguments = ProgramArguments()  # read terminal arguments
    vs = cv2.VideoCapture(arguments.file)  # read video file
    frame_0 = vs.read()[1]  # read first frame
    total_frames = int(vs.get(cv2.CAP_PROP_FRAME_COUNT))  # get total frames
    rectangles: {int: Rectangle} = {}  # we initialize a dictionary to store the rectangles
    frame_height, frame_width = frame_0.shape[:2]  # this is the size of the original video
    final_width = int(frame_height / 16 * 9)  # this is the width of the final video
    final_height = frame_height  # We will keep the height of the final video the same as the original
    tracker = cv2.TrackerCSRT.create()  # initialize the tracker
    roi_found = False  # we will use this variable to check if the roi (region of interest) is found
    cur_frame_number = 0
    vs.set(cv2.CAP_PROP_POS_FRAMES, cur_frame_number)  # We reset the video to the first frame
```

### Reading the frame and some embellishments

We resize the frame to make it faster to process, and we convert it to gray if needed. Also, we display the previous
rectangle and the final crop so that we can better understand what the tracker is doing.

```python
    while cur_frame_number < total_frames:  # until we reach the end of the video
        frame = vs.read()[1]  # read the frame
        if frame is None:  # sometimes the frame is None before the end
            break
        # we reduce the size of the frame to make it faster to process
        resized_frame = imutils.resize(frame, width=int(frame_width / arguments.ratio))
        # sometimes it's better to work with gray images
        if arguments.gray:
            resized_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2GRAY)
        if cur_frame_number - 1 > 0 and rectangles.get(cur_frame_number - 1, None) is not None:
            # to better understand the tracker we display the tracked rectangle of the previous frame
            rectangle = rectangles[cur_frame_number - 1]
            resized_rectangle = rectangle.scale(1 / arguments.ratio)
            final_rectangle = resized_rectangle.to_final_frame_cut(final_width, final_height)
            # this is the previous roi
            cv2.rectangle(resized_frame, resized_rectangle.point1(), rectangle.point2(), prev_frame_color, 2)
            # this is the final frame crop
            cv2.rectangle(resized_frame, final_rectangle.point1(), final_rectangle.point2(), final_crop_color, 10)
```

### Selecting the ROI

The ROI (Region of Interest) is the rectangle that we want to track. We are selecting it manually (it could be
automated, but normally only you know what you want to track).

```python
        # ... in the same loop
        if not roi_found:  # the tracker has lost the roi, or it's the first frame
            roi = cv2.selectROI(arguments.file, resized_frame, fromCenter=False, )  # we select the roi
            rectangles[cur_frame_number] = Rectangle.from_roi(roi, cur_frame_number)  # we store the roi
            tracker.init(resized_frame, roi)  # we initialize the tracker
            roi_found = True
        else:
            (roi_found, box) = tracker.update(resized_frame)  # we update the tracker
            if roi_found:  # if the tracker has found the roi
                (x, y, w, h) = [int(v) for v in box]
                cv2.rectangle(resized_frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                rectangles[cur_frame_number] = Rectangle(x, x + w, y, y + h, cur_frame_number)
```

### Displaying the frame

Each frame we display it, and we save the rectangle in the dictionary.

```python
        # ... in the same loop
        cv2.putText(resized_frame, "Frame: {}".format(cur_frame_number), (10, 20),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2) # we add some text to debug
        cv2.imshow(arguments.file, resized_frame) # we display the frame
        cv2.waitKey(1) & 0xFF # this is just to make the display work
        cur_frame_number += 1
```

### Result up to now

We can now test the code. We will see a window where we can select the ROI, and then we will see the tracker in action.

```bash
$ python3 tracker.py -f XPQlMmMDm-A-cut.mp4
```

<center>
<img src="partial1.png" style="max-width: 730px; text-align: center;margin: 20px 0 20px 0" alt="Partial result">
</center>

The green is the object found, the red represents the final output. At this stage we are not cropping the video, we are
just tracking the object. The result is not perfect, but let's proceed with the actual cropping.

### Cropping the video

To crop with ffmpeg we will create a script that will swap the rectangle that we want to keep with the left part of the
video, for each frame. The template of that script is the following:

```bash
swaprect=%s:%s:%s:0:%s:%s:enable='between(n,%s,%s)'
```

Things get a bit tricky because the swap doesn't work if there is an overlapping of the rectangles. So we need to split
the rectangles in smaller parts, such that they don't overlap.

and this is the code that produce the right line for each center of the rectangle

```python
def output(center_x, center_y, start, end, frame_width, frame_height, width, height):
    x2 = int(center_x - width / 2) # the top left corner of the rectangle
    y2 = int(center_y - height / 2) 
    if y2 < 0: # we don't want to go out of the frame
        y2 = 0
    if y2 + height > frame_height: # we don't want to go out of the frame
        y2 = frame_height - height
    if x2 <= 0: 
        x2 = int(width / 2) # if the x is out of the frame is tricky because we can't swaprect with negative values
    if x2 < width: # if the x is less than the width we need to split the rectangles to avoid overlappings`
        output = ""
        i = 0
        last = 0
        while (i + 1) * x2 <= width + x2: # just trust me on this, ok?
            output += "swaprect=%s:%s:%s:0:%s:%s:enable='between(n,%s,%s)',\n" % (
                x2, height, i * x2, (i + 1) * x2, y2, start, end)
            last = i * x2
            i += 1
        rest = width - last
        output += "swaprect=%s:%s:%s:0:%s:%s:enable='between(n,%s,%s)',\n" % (
            rest, height, i * x2, i * x2 + rest, y2, start, end)

        return output
    elif x2 + width > frame_width:
        x2 = frame_width - width
    return "swaprect=%s:%s:0:0:%s:%s:enable='between(n,%s,%s)',\n" % (width, height, x2, y2, start, end)
```

### Smoothing the motion

The tracker is moving every frame, especially short movements. We will smooth the motion using a gaussian filter.

```python
def smooth_centers(centers):
    # apply a gaussian filter to the centers
    from scipy.ndimage import gaussian_filter1d
    xs = np.array(list(map(lambda x: x[0], centers)))  # we don't care about y
    new_centers = gaussian_filter1d(xs, sigma=5)
    result = []
    for i in range(len(new_centers)):
        result.append((new_centers[i], centers[i][1], centers[i][2]))
    return result
```

### Generating the script

Now that we have all the pieces we can generate the script that will crop the video.

```python

def output(center_x, center_y, start, end, frame_width, frame_height, width, height):
    center_x = int(center_x)
    center_y = int(center_y)
    frame_width = int(frame_width)
    frame_height = int(frame_height)
    x2 = int(center_x - width / 2)
    y2 = int(center_y - height / 2)
    if y2 < 0:
        y2 = 0
    if y2 + height > frame_height:
        y2 = frame_height - height
    if x2 <= 0:
        x2 = int(width / 2)
    if x2 < width:
        output = ""
        i = 0
        last = 0
        while (i + 1) * x2 <= width + x2:
            output += "swaprect=%s:%s:%s:0:%s:%s:enable='between(n,%s,%s)',\n" % (
                x2, height, i * x2, (i + 1) * x2, y2, start, end)
            last = i * x2
            i += 1
        rest = width - last
        output += "swaprect=%s:%s:%s:0:%s:%s:enable='between(n,%s,%s)',\n" % (
            rest, height, i * x2, i * x2 + rest, y2, start, end)

        return output
    elif x2 + width > frame_width:
        x2 = frame_width - width
    return "swaprect=%s:%s:0:0:%s:%s:enable='between(n,%s,%s)',\n" % (width, height, x2, y2, start, end)


def write_to_file(centers, frame_width, frame_height, args: ProgramArguments):
    with open(args.output, "w") as file:
        total = len(centers)
        i = 0
        prev_i = 0
        height = frame_height
        width = int(height * 9 / 16) + 1
        while i < total:
            if centers[i] is None:
                i += 1
                continue
            center_x, center_y, frame_i = centers[i]
            try:
                prev_center_x, prev_center_y, prev_frame_i = centers[prev_i]
            except:
                prev_i = i
                prev_center_x, prev_center_y, prev_frame_i = centers[i]

            changed = abs(center_x - prev_center_x) > args.delta or abs(center_y - prev_center_y) > args.delta
            if changed:
                delta_frames = frame_i - prev_i
                center_step_x = (center_x - prev_center_x) / delta_frames
                center_step_y = (center_y - prev_center_y) / delta_frames
                for j in range(prev_i, frame_i + 1):
                    prev_center_x += center_step_x
                    prev_center_y += center_step_y
                    file.write(output(prev_center_x, 0, j, j, frame_width, frame_height, width, height))
                prev_i = frame_i + 1
            i = i + 1
        file.write(output(center_x, center_y, prev_i, total * 2, frame_width, frame_height, width, height))
        file.write("crop=%s:%s:0:0,\n" % (width, height))
``` 

## The Result

We can now run the script to crop the video

```bash
$ python3 tracker.py -f XPQlMmMDm-A-cut.mp4 -o crop.sh
$ ffmpeg -nostats -hide_banner -loglevel error -y -ss "00:00:00" -i XPQlMmMDm-A-cut.mp4 -an -filter_script:v:0 crop.sh result.mp4
```

## The Powershell Script

To make it easier to run the script we can create a powershell script that will do everything for us.

```powershell

# Parse argumentsS
param (
    [Parameter(Mandatory=$true)][string]$YouTubeLink,
    [Parameter(Mandatory=$true)][string]$Start,
    [Parameter(Mandatory=$true)][string]$Stop,
    [Parameter(Mandatory=$true)][string]$Title
)

# Check for unknown options
$args | ForEach-Object {
    if ($_ -notmatch '^-[a-z]=')
    {
        Write-Error "Unknown option $_"
        exit 1
    }
}

# Compute derived variables
$FileName = "$Title"
$FileNameSafe = $FileName -replace ' ', '_'
$Ext = "webm"
$FilenameFromLink = $YouTubeLink.Split('=')[-1]
$InputPath = "verticals\$FilenameFromLink\raw.$Ext"
$CutVideo = "verticals\$FilenameFromLink\${FileNameSafe}_cut.mp4"
$CutLabeled = "verticals\$FilenameFromLink\${FileNameSafe}_cut_labeld.mp4"
$CutLabeledInput = "verticals\$FilenameFromLink\${FileNameSafe}_cut_labeled.txt"
$CroppedVideo = "verticals\$FilenameFromLink\${FileNameSafe}_cropped_labeled.mp4"
$CroppedVideoInput = "verticals\$FilenameFromLink\${FileNameSafe}_cropped.txt"


# Download video if it doesn't exist
if (-Not (Test-Path -Path $InputPath))
{
    Write-Output "Downloading video"
    & yt-dlp.exe --quiet --progress $YouTubeLink -f "bestvideo/best" -o $InputPath --merge-output-format webm
}
else
{
    Write-Output "Video already downloaded"
}

# Cut the video if it doesn't exist
if (-Not (Test-Path -Path $CutVideo))
{
    Write-Output "Cutting video"
    & ffmpeg -hwaccel cuda -nostats -hide_banner -loglevel error -y -i $InputPath -ss $Start -t $Stop $CutVideo
}
else
{
    Write-Output "Video already cut"
}

# Create label if it doesn't exist
if (-Not (Test-Path -Path $CutLabeledInput))
{
    Write-Output "Creating label"
    & .venv/Scripts/python.exe main.py --dry-run --file $CutVideo -y "$YouTubeLink" -o "$CutLabeledInput"
}
else
{
    Write-Output "Label already created"
}

# Create labeled video if it doesn't exist
if (-Not (Test-Path -Path $CutLabeled))
{
    Write-Output "Creating labeled video"
    Start-Process ffmpeg -ArgumentList "-hwaccel","cuda", "-nostats", "-hide_banner", "-loglevel", "error", "-y", "-ss", "00:00:00", "-i", "$CutVideo", "-an", "-filter_script:v:0", "$CutLabeledInput", "$CutLabeled" -NoNewWindow -Wait
}
else
{
    Write-Output "Labeled video already created"
}

# Create tracking if it doesn't exist
if (-Not (Test-Path -Path $CroppedVideoInput))
{
    Write-Output "Creating tracking"
    & .venv/Scripts/python.exe main.py -d 10 --file $CutVideo -y $YouTubeLink -o $CroppedVideoInput
}
else
{
    Write-Output "Tracking already created"
}

# Create cropped video if it doesn't exist
if (-Not (Test-Path -Path $CroppedVideo))
{
    Write-Output "Creating cropped video"
    & ffmpeg -hwaccel cuda -nostats -hide_banner -loglevel error -y -ss "00:00:00" -i $CutVideo -an -filter_script:v:0 $CroppedVideoInput $CroppedVideo
}
else
{
    Write-Output "Cropped video already created"
}
```

## Conclusion

We have seen how to crop a video from horizontal to vertical, following an object that moves. 
This is the final result:
```powershell
.\maker.ps1 -YouTubeLink "https://www.youtube.com/watch?v=XPQlMmMDm-A" -Start "00:00:00" -Stop "00:00:15" -Title "Singer Parrot"
```

<center>
<video src
         ="/tutorials/vertical-video-from-youtube/XPQlMmMDm-A-cropped.mp4"
         controls="controls" style="max-width: 730px; text-align: center;margin: 20px 0 20px 0">
</video>
</center>

The final code is available on [GitHub](https://github.com/faaabio1618/pyTracker).
