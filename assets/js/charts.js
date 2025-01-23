document.addEventListener('DOMContentLoaded', chart_init, false);

async function fillData() {

    const appSpecs = function (data) {
        Highcharts.chart('apps-specs', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Apps by specs'
            },
            xAxis: {
                type: 'category',
                lineColor: '#404040',
                tickColor: '#404040'
            },
            yAxis: {
                title: {
                    text: 'Number of Apps',
                    style: {
                        color: '#ffffff'
                    }
                },
                gridLineColor: '#2d2d2d',
                gridLineDashStyle: 'Dot'
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                    colorByPoint: true,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                style: {
                    color: '#ffffff'
                },
                borderWidth: 0,
                shadow: true,
                formatter: function () {
                    return `<b>${this.point.name}</b><br/>` +
                        `${Highcharts.numberFormat(this.y, 0)} apps`;
                }
            },
            legend: {
                enabled: false
            },
            series:
                [{
                    name: 'Apps',
                    colorByPoint: true,
                    data: data["specs"]
                }]

        });
    }

    const geoMap = function (geoData) {
        Highcharts.mapChart('container', {
            chart: {
                map: topology
            },
            title: {
                text: 'European Train Stations Near Airports',
                align: 'left'
            },
            subtitle: {
                text: 'Source: <a href="https://github.com/trainline-eu/stations">' +
                    'github.com/trainline-eu/stations</a>',
                align: 'left'
            },
            mapNavigation: {
                enabled: true
            },
            tooltip: {
                headerFormat: '',
                pointFormat: '<b>{point.name}</b><br>Lat: {point.lat:.2f}, Lon: ' +
                    '{point.lon:.2f}'
            },
            colorAxis: {
                min: 0,
                max: 20
            },
            plotOptions: {
                mappoint: {
                    cluster: {
                        enabled: true,
                        allowOverlap: false,
                        animation: {
                            duration: 450
                        },
                        layoutAlgorithm: {
                            type: 'grid',
                            gridSize: 70
                        },
                        zones: [{
                            from: 1,
                            to: 4,
                            marker: {
                                radius: 13
                            }
                        }, {
                            from: 5,
                            to: 9,
                            marker: {
                                radius: 15
                            }
                        }, {
                            from: 10,
                            to: 15,
                            marker: {
                                radius: 17
                            }
                        }, {
                            from: 16,
                            to: 20,
                            marker: {
                                radius: 19
                            }
                        }, {
                            from: 21,
                            to: 100,
                            marker: {
                                radius: 21
                            }
                        }]
                    }
                }
            },
            series: [{
                name: 'Europe',
                accessibility: {
                    exposeAsGroupOnly: true
                },
                borderColor: '#A0A0A0',
                nullColor: 'rgba(177, 244, 177, 0.5)',
                showInLegend: false
            }, {
                type: 'mappoint',
                enableMouseTracking: true,
                accessibility: {
                    point: {
                        descriptionFormat: '{#if isCluster}' +
                            'Grouping of {clusterPointsAmount} points.' +
                            '{else}' +
                            '{name}, country code: {country}.' +
                            '{/if}'
                    }
                },
                colorKey: 'clusterPointsAmount',
                name: 'Cities',
                data: data,
                color: Highcharts.getOptions().colors[5],
                marker: {
                    lineWidth: 1,
                    lineColor: '#fff',
                    symbol: 'mapmarker',
                    radius: 8
                },
                dataLabels: {
                    verticalAlign: 'top'
                }
            }]
        });


    }


    const categoriesBar = function (data) {
        let datum = data["apps-by-categories"];
        datum.sort((a, b) => a.y - b.y);

        Highcharts.chart('categories-bar', {
            chart: {
                type: 'column',
                backgroundColor: '#1a1a1a',
                style: {
                    fontFamily: 'Roboto, sans-serif'
                }
            },
            title: {
                text: 'Apps by Categories',
                align: 'left',
                style: {
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: '600'
                }
            },
            xAxis: {
                type: 'category',
                labels: {
                    style: {
                        color: '#ffffff',
                        fontSize: '11px'
                    },
                    autoRotation: [-45],
                    align: 'right'
                },
                lineColor: '#404040',
                tickColor: '#404040'
            },
            yAxis: {
                title: {
                    text: 'Number of Apps',
                    style: {
                        color: '#ffffff'
                    }
                },
                labels: {
                    style: {
                        color: '#ffffff'
                    }
                },
                gridLineColor: '#2d2d2d',
                gridLineDashStyle: 'Dot'
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                    colorByPoint: true,
                    colors: ['#60A5FA', '#5096E3', '#4087D6', '#3078C9', '#2069BC',
                        '#105AAF', '#004BA2', '#003C95', '#002D88', '#001E7B']
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                style: {
                    color: '#ffffff'
                },
                borderWidth: 0,
                shadow: true,
                formatter: function () {
                    return `<b>${this.point.name}</b><br/>` +
                        `${Highcharts.numberFormat(this.y, 0)} apps`;
                }
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Apps',
                data: datum
            }]
        });

    }

    const languagesBar = function (data) {
        let datum = data["apps-by-language"];
        datum.sort((a, b) => a.y - b.y);

        Highcharts.chart('languages-bar', {
            chart: {
                type: 'column',
                backgroundColor: '#1a1a1a',
                style: {
                    fontFamily: 'Roboto, sans-serif'
                }
            },
            title: {
                text: 'Apps by Languages',
                align: 'left',
                style: {
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: '600'
                }
            },
            xAxis: {
                type: 'category',
                labels: {
                    style: {
                        color: '#ffffff',
                        fontSize: '11px'
                    },
                    autoRotation: [-45],
                    align: 'right'
                },
                lineColor: '#404040',
                tickColor: '#404040'
            },
            yAxis: {
                type: 'logarithmic',
                title: {
                    text: 'Number of Apps',
                    style: {
                        color: '#ffffff'
                    }
                },
                labels: {
                    style: {
                        color: '#ffffff'
                    }
                },
                gridLineColor: '#2d2d2d',
                gridLineDashStyle: 'Dot',
                min: 1
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                    colorByPoint: true,
                    colors: ['#60A5FA', '#5096E3', '#4087D6', '#3078C9', '#2069BC',
                        '#105AAF', '#004BA2', '#003C95', '#002D88', '#001E7B']
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                style: {
                    color: '#ffffff'
                },
                borderWidth: 0,
                shadow: true,
                formatter: function () {
                    return `<b>${this.point.name}</b><br/>` +
                        `${Highcharts.numberFormat(this.y, 0)} apps`;
                }
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Apps',
                data: datum
            }]
        });

    }

    const reviewPie = function (data) {
        Highcharts.chart('reviews-pie', {
            chart: {
                type: 'pie',
                backgroundColor: '#1a1a1a',
                style: {
                    fontFamily: 'Roboto, sans-serif'
                }
            },
            title: {
                text: 'Apps by Average Reviews',
                align: 'left',
                style: {
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: '600'
                }
            },
            plotOptions: {
                pie: {
                    borderRadius: 5,
                    borderWidth: 2,
                    borderColor: '#1a1a1a',
                    colors: [
                        '#60A5FA',
                        '#0EA5E9',
                        '#2F80ED',
                        '#4A90E2',
                        '#0052CC',
                        '#1E3A8A',
                        '#1E40AF',
                        '#0C4A6E',
                        '#3B82F6',
                        '#7DD3FC',
                        '#FF9988',
                    ],
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: '#ffffff',
                            textOutline: '2px contrast',
                            fontSize: '14px'
                        },
                        connectorColor: 'rgba(255, 255, 255, 0.5)',
                        distance: 20
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                style: {
                    color: '#ffffff'
                },
                borderWidth: 0,
                shadow: true,
                pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y:,.0f} apps)'
            },
            legend: {
                enabled: true,
                itemStyle: {
                    color: '#ffffff'
                },
                itemHoverStyle: {
                    color: '#4198ff'
                }
            },
            credits: {
                style: {
                    color: '#666'
                }
            },
            series: [{
                name: 'Reviews',
                colorByPoint: true,
                data: data["apps-by-reviews"],
                animation: {
                    duration: 1500
                }
            }]
        });
    }

    const historicalData = function (data) {
        Highcharts.chart('apps-by-year', {
            chart: {
                type: 'column',
                backgroundColor: '#1a1a1a',
                style: {
                    fontFamily: 'Roboto, sans-serif'
                }
            },
            title: {
                text: 'Apps Published by Year',
                align: 'left',
                style: {
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: '600'
                }
            },
            subtitle: {
                text: '(Still available in the store)',
                align: 'left',
                style: {
                    color: '#cccccc',
                    fontSize: '14px'
                }
            },
            xAxis: {
                categories: data["historical-data"]["categories"],
                labels: {
                    style: {
                        color: '#ffffff'
                    }
                },
                lineColor: '#404040',
                tickColor: '#404040'
            },
            yAxis: {
                title: {
                    text: 'Apps Published',
                    style: {
                        color: '#ffffff'
                    }
                },
                labels: {
                    style: {
                        color: '#ffffff'
                    }
                },
                gridLineColor: 'rgba(255, 255, 255, 0.1)'
            },
            plotOptions: {
                column: {
                    borderRadius: 5,
                    gradient: {
                        enabled: true
                    },
                    color: {
                        linearGradient: {
                            x1: 0,
                            x2: 0,
                            y1: 0,
                            y2: 1
                        },
                        stops: [
                            [0, '#4198ff'],    // Lighter blue at top
                            [1, '#2763ba']     // Darker blue at bottom
                        ]
                    },
                    states: {
                        hover: {
                            brightness: 0.1
                        }
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                style: {
                    color: '#ffffff'
                },
                borderWidth: 0,
                shadow: true
            },
            legend: {
                enabled: false  // Since we only have one series
            },
            credits: {
                style: {
                    color: '#666'
                }
            },
            series: [{
                name: 'Apps Published',
                data: data["historical-data"]["data"],
                animation: {
                    duration: 1500
                }
            }]
        });
    }
    const geographicalData = async function (topology, data) {

        Highcharts.mapChart('developers-by-country', {
            chart: {
                map: topology,
                backgroundColor: '#1a1a1a',
                style: {
                    fontFamily: 'Roboto, sans-serif'
                }
            },
            title: {
                text: 'Developers by Country',
                align: 'left',
                style: {
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: '600'
                }
            },
            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom',
                    theme: {
                        fill: '#2d2d2d',
                        stroke: '#ffffff',
                        states: {
                            hover: {
                                fill: '#404040'
                            },
                            select: {
                                fill: '#404040'
                            }
                        },
                        style: {
                            color: '#ffffff'
                        }
                    }
                }
            },
            colorAxis: {
                min: 60,
                stops: [
                    [0, '#2763ba'],    // Darker blue for low values
                    [0.5, '#4198ff'],  // Medium blue for middle values
                    [1, '#7cb5ff']     // Lighter blue for high values
                ],
                labels: {
                    style: {
                        color: '#ffffff'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                style: {
                    color: '#ffffff'
                },
                borderWidth: 0,
                shadow: true,
                valueDecimals: 0,
                valueSuffix: ' developers'
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Developers per Country',
                joinBy: ['iso-a3', 'code'],
                data: data["geographical-data"],
                states: {
                    hover: {
                        color: '#4dc9ff'  // Bright blue for hover state
                    }
                },
                dataLabels: {
                    enabled: true,
                    format: '{point.value:.0f}',
                    filter: {
                        operator: '>',
                        property: 'labelrank',
                        value: 250
                    },
                    style: {
                        color: '#ffffff',
                        textOutline: '2px contrast',
                        fontWeight: 'normal',
                        fontSize: '14px'
                    }
                },
                borderColor: '#404040',
                nullColor: 'rgba(200, 200, 200, 0.05)'
            }]
        });
    }

    async function detailedGeoData(topology, geoData) {


        Highcharts.mapChart('detailed-geo', {
            chart: {
                map: topology,
                backgroundColor: '#1a1a1a'
            },
            title: {
                text: 'Global Developer Distribution',
                style: {
                    color: '#ffffff'
                }
            },
            mapNavigation: {
                enabled: true
            },
            series: [{
                name: 'Basemap',
                borderColor: '#404040',
                nullColor: 'rgba(200, 200, 200, 0.05)',
                showInLegend: false
            }, {
                type: 'mappoint',
                name: 'Developers',
                data: geoData,
                tooltip: {
                    pointFormat: '{point.name}'  // Only show name in point tooltip
                },
                cluster: {
                    enabled: true,
                    allowOverlap: false,
                    layoutAlgorithm: {
                        type: 'grid',
                        gridSize: 40
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.clusterPointsAmount}',
                        style: {
                            color: 'white',
                            textOutline: '2px contrast',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }
                    },
                    formatter: function () {
                        if (this.point.clusteredData) {
                            return `${this.point.clusterPointsAmount} developers in this area`;
                        }
                        // Just return the name for individual points
                        return `${this.point.name}`;
                    },
                    marker: {
                        fillColor: {
                            radialGradient: {cx: 0.4, cy: 0.3, r: 0.7},
                            stops: [
                                [0, '#4198ff'],
                                [1, '#2763ba']
                            ]
                        },
                        lineColor: '#1a1a1a',
                        lineWidth: 2,
                        symbol: 'circle'
                    },
                    zones: [
                        {
                            from: 3000,
                            marker: {radius: 35}
                        },
                        {
                            from: 1000,
                            to: 2999,
                            marker: {radius: 30}
                        },
                        {
                            from: 500,
                            to: 999,
                            marker: {radius: 25}
                        },
                        {
                            from: 100,
                            to: 499,
                            marker: {radius: 20}
                        },
                        {
                            from: 50,
                            to: 99,
                            marker: {radius: 15}
                        },
                        {
                            from: 1,
                            to: 49,
                            marker: {radius: 10}
                        }
                    ]
                }
            }]
        });

    }

    const topology = await fetch(
        'https://code.highcharts.com/mapdata/custom/world.topo.json').then(response => response.json());

    const reportData = await fetch('/reports/apps/report.json').then(response => response.json());
    const geoData = await fetch('/reports/apps/geodata.json').then(response => response.json());

    for (const dataKey in reportData) {
        const elem = document.querySelector(`[data-${dataKey}]`);
        if (elem) elem.innerText = reportData[dataKey];
    }
    window.reportData = reportData;
    window.geoData = geoData;
    historicalData(reportData);
    appSpecs(reportData);
    reviewPie(reportData);
    languagesBar(reportData);
    categoriesBar(reportData);
    await geographicalData(topology, reportData);
    setTimeout(() => detailedGeoData(topology, geoData), 0);


}

function chart_init() {
    if (location.pathname.includes("reports/apps")) {
        fillData();
    }
}