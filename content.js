const getDateOfYear = (date) =>
    Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0)) / 864e5);

const percentageChange = (a, b) => (b / a * 100) - 100;

if (!Number.prototype.secondsToDHM) {
    Number.prototype.secondsToDHM = function () {
        const secsPerDay = 86400;
        const secsPerHour = 3600;
        const secsPerMinute = 60;

        var seconds = Math.abs(this);
        var minus = (this < 0) ? '-' : '';

        var days = Math.floor(seconds / secsPerDay);
        seconds = (seconds % secsPerDay);
        var hours = Math.floor(seconds / secsPerHour);
        seconds = (seconds % secsPerHour);
        var minutes = Math.floor(seconds / secsPerMinute);
        seconds = (seconds % secsPerMinute);

        if (days > 0) {
            hours += days * 24;
        }

        var sDays = new String(days).padStart(1, '0');
        var sHours = new String(hours).padStart(1, '0');
        var sMinutes = new String(minutes).padStart(2, '0');
        var sSeconds = new String(new Number(seconds).toFixed(0)).padStart(2, '0');

        if (hours > 0) {
            return `${sHours}:${sMinutes}:${sSeconds}`;
        } else {
            var sMinutes = new String(minutes).padStart(1, '0');
            return `${sMinutes}:${sSeconds}`;
        }
    }
}

var avatar = function (id, badge, img, tp) {
    return '<div class="avatar avatar-athlete avatar-' + tp + '">' +
        '<a class="avatar-content" href="/athletes/' + id + '">' +
        '<div class="avatar-img-wrapper">' +
        (badge ? '<div class="avatar-badge"><span class="app-icon-wrapper"><span class="app-icon icon-badge-premium"></span></span></div>' : '') +
        '<img class="avatar-img" src="' + img + '">' +
        '</div>' +
        '</a>' +
        '</div>';
}

let check = window.setInterval(function () {
    if ($('div.leaderboard').length == 1 && $('li.members-tab').length == 1) {
        clearInterval(check);

        let totalKm = 0;
        let totalElev = 0;
        let totalTime = 0;

        let totalKmPrev = 0;
        let totalElevPrev = 0;
        let totalTimePrev = 0;

        try {
            var me = $('div.leaderboard-page div.section:last table tbody tr.you td.athlete a').attr('href');
        } catch (e) {
            var me = '';
        }

        $('div.spans11').toggleClass('spans11 spans16');

        $('div.leaderboard-page div.section:last').hide();

        $('div.leaderboard-page div.section:last').after('<div class="section total p0">' +
            '<ul class= "week-toggle switches float-right">' +
            '<li><span class="button last-week">Last Week</span></li>' +
            '<li><span class="button this-week selected">This Week</span></li>' +
            '<li><span class="button fellows">Fellows</span></li>' +
            '<li><span class="button this-year">This Year</span></li>' +
            '</ul>' +
            '<h2 class="topless leaderboard-type section-title">' +
            '<span class="lastweek" style="display: none;">Last Week\'s Leaderboard</span>' +
            '<span class="thisweek" style="display: none;">This Week\'s Leaderboard</span>' +
            '<span class="couples" style="display: none;">Fellows Leaderboard</span>' +
            '<span class="year" style="display: none;">This Year\'s Leaderboard</span>' +
            '</h2>' +
            '<div class="athlete-rank mt-sm mb-sm"><ul class="inline-stats thisweek" style="display: none;"><li class="total-club-km">&nbsp;</li><li class="total-club-elev">&nbsp;</li><li class="total-club-time">&nbsp;</li></ul></div>' +
            '<div class="athlete-rank mt-sm mb-sm"><ul class="inline-stats lastweek" style="display: none;"><li class="total-club-km">&nbsp;</li><li class="total-club-elev">&nbsp;</li><li class="total-club-time">&nbsp;</li></ul></div>' +
            '<div class="athlete-rank mt-sm mb-sm"><ul class="inline-stats couples" style="display: none;"><li class="total-club-km">&nbsp;</li><li class="total-club-elev">&nbsp;</li><li class="total-club-time">&nbsp;</li></ul></div>' +
            '</div>');

        let sections = ['lastweek', 'thisweek', 'couples', 'year'];
        $(".switches").on('click', 'li span.button', function (e) {
            e.preventDefault();
            let $this = $(this);
            let index = $this.parent().index();
            let section = sections[index];
            $this.parent().siblings().find('span.button').removeClass('selected');
            $this.addClass('selected');
            $.each(sections, function (i, el) {
                $('div.section.' + el).css('visibility', 'hidden').hide();
                $('ul.inline-stats.' + el).hide();
                $('h2.section-title span.' + el).hide();
            });
            $('div.section.' + section).css('visibility', 'visible').show();
            $('ul.inline-stats.' + section).show();
            $('h2.section-title span.' + section).show();
        });

        let members = [];
        let parsed = 0;
        let parsedPrevYear = 0;

        $.get($('li.members-tab a').attr('href'), function (data) {
            let $data = $(data);
            $.each($data.find('.list-athletes .avatar-athlete'), function (i, el) {
                members.push({
                    'athlete_id': parseInt($('a', el).attr('href').replace('/athletes/', '')),
                    'href': $('a', el).attr('href'),
                    'name': $(el).attr('title'),
                    'avatar': $('.avatar-content', el).html(),
                    'raw': $(el).html(),
                    'activities': 0,
                    'distance': 0
                });
            });

            if (members.length > 0) {
                $.each(members, function (i, el) {
                    let url = el.href + '/profile_sidebar_comparison?hl=en-US';
                    $.get(url, function (data) {
                        let $data = $(data);
                        let btn = $data.find("button[title='Run']");
                        let tab = 0;
                        [0, 1, 2, 3, 4, 5].forEach(function (i) {
                            if (btn.hasClass('sport-' + i + '-tab')) {
                                tab = i;
                            }
                        });
                        let $table = $data.find('#sport-' + tab + '-ytd');
                        $table.find('tr').each(function () {
                            let $row = $(this);
                            let $cells = $row.find('td');
                            let $name = $cells.eq(0);
                            let $value = $cells.eq(1);
                            if ($name.text() == 'Activities') {
                                el.activities = $value.text();
                            }
                            if ($name.text() == 'Distance') {
                                el.distance = $value.text().replace('km', '<abbr class="unit short">km</abbr>');
                                el.distanceOrder = parseFloat($value.text().replace(' km', '').replace(',', ''));
                                el.avgMonth = (parseFloat($value.text().replace(' km', '').replace(',', '')) / getDateOfYear(new Date()) * 31).toFixed(2);
                                el.avgWeek = (parseFloat($value.text().replace(' km', '').replace(',', '')) / getDateOfYear(new Date()) * 7).toFixed(2);
                            }
                            if ($name.text() == 'Time') {
                                el.time = $value.text();
                                el.timeOrder = parseFloat($value.text().replace('h ', '.').replace('m', ''));
                            }
                            if ($name.text() == 'Elev Gain') {
                                el.elev = $value.text().replace('m', '<abbr class="unit short">m</abbr>');
                                el.elevOrder = parseFloat($value.text().replace(' m', '').replace(',', ''));
                            }
                        });
                        if (el.activities > 0) {
                            el.avgDistance = (el.distanceOrder / el.activities).toFixed(2);
                        } else {
                            el.avgDistance = 0;
                        }

                        let a = (el.timeOrder).toString().split('.');
                        if (a.length == 1) {
                            var sec = (+a[0]) * 60;
                        } else {
                            var sec = (+a[0]) * 60 * 60;
                            if (a[1] > 0) {
                                sec += (+a[1]) * 60;
                            }
                        }
                        if (el.distanceOrder > 0) {
                            el.avgPaceOrder = (sec * (1 / el.distanceOrder) / 60).toFixed(2);
                        } else {
                            el.avgPaceOrder = 99;
                        }

                        let b = (el.avgPaceOrder).toString().split('.');
                        let min = (+b[0]);
                        let sec2 = (+b[1]);
                        if (el.distanceOrder > 0) {
                            el.avgPace = min + ':' + (sec2 == 0 ? '00' : ("0" + (sec2 / 100 * 60).toFixed(0)).slice(-2));
                        } else {
                            el.avgPace = '0:00';
                        }
                        parsed++;
                    });
                });

                $.each(members, function (i, el) {
                    let urlPrev = el.href + '/profile_sidebar_comparison?hl=en-US&ytd_year=2024';
                    $.get(urlPrev, function (data) {
                        let $data = $(data);
                        let btn = $data.find("button[title='Run']");
                        let tab = 0;
                        [0, 1, 2, 3, 4, 5].forEach(function (i) {
                            if (btn.hasClass('sport-' + i + '-tab')) {
                                tab = i;
                            }
                        });
                        let $table = $data.find('#sport-' + tab + '-ytd');
                        $table.find('tr').each(function () {
                            let $row = $(this);
                            let $cells = $row.find('td');
                            let $name = $cells.eq(0);
                            let $value = $cells.eq(1);
                            if ($name.text() == 'Activities') {
                                el.activitiesPrev = $value.text();
                            }
                            if ($name.text() == 'Distance') {
                                el.distancePrev = $value.text();
                                el.distancePrevOrder = parseFloat($value.text().replace(' km', '').replace(',', ''));
                            }
                            if ($name.text() == 'Time') {
                                el.timePrev = $value.text();
                                el.timePrevOrder = parseFloat($value.text().replace('h ', '.').replace('m', ''));
                            }
                            if ($name.text() == 'Elev Gain') {
                                el.elevPrev = $value.text();
                                el.elevPrevOrder = parseFloat($value.text().replace(' m', '').replace(',', ''));
                            }
                        });
                        parsedPrevYear++;
                    });
                });

                let ajaxCheck = window.setInterval(function () {
                    if (parsed == members.length && parsedPrevYear == members.length) {
                        clearInterval(ajaxCheck);

                        $('div.leaderboard-page div.section:last').after('<div class="section year p0" style="visibility:hidden;"></div>');
                        $('div.section.year').append('<div class="leaderboard"><table class="table table-striped table-hover order-column"><thead><tr><th class="rank">Rank</th><th class="athlete">Athlete</th><th class="distance">Distance</th><th class="elev">Elev. Gain</th><th class="avg-month">Avg. Month</th><th class="avg-week">Avg. Week</th><th class="avg-week">Avg. Pace</th><th class="avg-week">Avg. Distance</th><th class="activities hidden-xs">Activities</th><th class="time hidden-xs">Time</th></tr></thead><tbody></tbody></table></div>');

                        $.each(members, function (i, el) {
                            el.distanceDifference = percentageChange(el.distancePrevOrder, ((el.distanceOrder / getDateOfYear(new Date())) * 365)).toFixed(2);
                            el.elevDifference = percentageChange(el.elevPrevOrder, ((el.elevOrder / getDateOfYear(new Date())) * 365)).toFixed(2);
                            $('div.section.year table tbody').append('<tr ' + (me == el.href ? 'class="you"' : '') + '>' +
                                '<td>' + (i + 1) + '</td>' +
                                '<td class="athlete">' +
                                '<div class= "avatar avatar-athlete avatar-sm">' +
                                '<a class="avatar-content" href="' + el.href + '">' +
                                el.avatar +
                                '</a>' +
                                '</div>' +
                                '<a class="athlete-name minimal" href="' + el.href + '">' + el.name + '</a>' +
                                '</td>' +
                                '<td data-order="' + el.distanceOrder + '">' + el.distance + '<br><small class="' + (el.distanceDifference > 0 ? 'green' : 'red') + '">' + el.distanceDifference + '%</small></td>' +
                                '<td data-order="' + el.elevOrder + '">' + el.elev + '<br><small class="' + (el.elevDifference > 0 ? 'green' : 'red') + '">' + el.elevDifference + '%</small></td>' +
                                '<td data-order="' + el.avgMonth + '">' + el.avgMonth + ' <abbr class="unit short">km</abbr></td>' +
                                '<td data-order="' + el.avgWeek + '">' + el.avgWeek + ' <abbr class="unit short">km</abbr></td>' +
                                '<td data-order="' + el.avgPaceOrder + '">' + el.avgPace + ' <abbr class="unit short">/km</abbr></td>' +
                                '<td data-order="' + el.avgDistance + '">' + el.avgDistance + ' <abbr class="unit short">km</abbr></td>' +
                                '<td>' + el.activities + '</td>' +
                                '<td data-order="' + el.timeOrder + '">' + el.time + '</td>' +
                                '</tr>');
                        });

                        let dt = new DataTable('div.section.year table', {
                            order: [[2, 'desc']],
                            paging: false,
                            info: false,
                            searching: false,
                            columnDefs: [{
                                targets: [0, 1],
                                orderable: false
                            }, {
                                targets: [2, 3, 4, 5, 7, 8, 9],
                                orderSequence: ["desc", "asc"]
                            }],
                            fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                                $('td:eq(0)', nRow).html(iDisplayIndexFull + 1);
                            }
                        });
                        $(".switches li span.this-week").trigger('click');
                    }
                }, 100);
            }
        });

        let prevWeek = [];
        let thisWeek = [];
        let couples = [];

        $.ajax({
            url: window.location.href.replace('/leaderboard', '') + '/leaderboard?week_offset=1',
            type: "GET",
            dataType: "json",
            headers: {
                "X-Csrf-Token": $('meta[name="csrf-token"]').attr('content'),
                "Accept": "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
            },
            success: function (data) {
                //let $data = JSON.parse(data);
                prevWeek = data.data;
                $.ajax({
                    url: window.location.href.replace('/leaderboard', '') + '/leaderboard',
                    type: "GET",
                    dataType: "json",
                    headers: {
                        "X-Csrf-Token": $('meta[name="csrf-token"]').attr('content'),
                        "Accept": "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
                    },
                    success: function (data) {
                        //let $data = JSON.parse(data);
                        thisWeek = data.data;

                        $.each(thisWeek, function (i, el) {
                            totalKm += el.distance;
                            totalElev += el.elev_gain;
                            totalTime += el.moving_time;
                        });

                        $.each(prevWeek, function (i, el) {
                            totalKmPrev += el.distance;
                            totalElevPrev += el.elev_gain;
                            totalTimePrev += el.moving_time;
                        });

                        $('.thisweek li.total-club-km').html('<strong>' + (totalKm / 1000).toFixed(2) + ' <abbr class="unit short">km</abbr></strong><div class="label">Total Distance</div>');
                        $('.thisweek li.total-club-elev').html('<strong>' + totalElev.toFixed(0) + ' <abbr class="unit short">m</abbr></strong><div class="label">Total Elevation</div>');
                        $('.thisweek li.total-club-time').html('<strong>' + new Number(totalTime).secondsToDHM() + '</strong><div class="label">Total Time</div>');

                        $('.couples li.total-club-km').html('<strong>' + (totalKm / 1000).toFixed(2) + ' <abbr class="unit short">km</abbr></strong><div class="label">Total Distance</div>');
                        $('.couples li.total-club-elev').html('<strong>' + totalElev.toFixed(0) + ' <abbr class="unit short">m</abbr></strong><div class="label">Total Elevation</div>');
                        $('.couples li.total-club-time').html('<strong>' + new Number(totalTime).secondsToDHM() + '</strong><div class="label">Total Time</div>');

                        $('.lastweek li.total-club-km').html('<strong>' + (totalKmPrev / 1000).toFixed(2) + ' <abbr class="unit short">km</abbr></strong><div class="label">Total Distance</div>');
                        $('.lastweek li.total-club-elev').html('<strong>' + totalElevPrev.toFixed(0) + ' <abbr class="unit short">m</abbr></strong><div class="label">Total Elevation</div>');
                        $('.lastweek li.total-club-time').html('<strong>' + new Number(totalTimePrev).secondsToDHM() + '</strong><div class="label">Total Time</div>');

                        couples[4] = [
                            prevWeek[4],
                            prevWeek[5]
                        ];
                        couples[3] = [
                            prevWeek[3],
                            prevWeek[6]
                        ];
                        couples[2] = [
                            prevWeek[2],
                            prevWeek[7]
                        ];
                        couples[1] = [
                            prevWeek[1],
                            prevWeek[8]
                        ];
                        couples[0] = [
                            prevWeek[0],
                            prevWeek[9]
                        ];

                        $('div.leaderboard-page div.section:last').after('<div class="section thisweek p0" style="visibility:hidden;"></div>');
                        $('div.section.thisweek').append('<div class="leaderboard"><table class="table table-striped table-hover order-column"><thead><tr><th class="rank">Rank</th><th class="athlete">Athlete</th><th class="distance">Distance</th><th class="runs">Runs</th><th class="longest">Longest</th><th class="pace">Avg. Pace</th><th class="elev">Elev. Gain</th><th class="time">Time</th><th class="trail">Trail Score</th></tr></thead><tbody></tbody></table></div>');

                        $.each(thisWeek, function (i, el) {
                            let distanceRaw = el.distance;
                            let distance = (el.distance / 1000).toFixed(2);
                            let runs = el.num_activities.toFixed(0);
                            let longestRaw = el.best_activities_distance;
                            let longest = (el.best_activities_distance / 1000).toFixed(2);
                            let paceRaw = el.moving_time / (el.distance / 1000);
                            let pace = new Number(el.moving_time / (el.distance / 1000)).secondsToDHM();
                            let elevation = el.elev_gain.toFixed(0);
                            let timeRaw = el.moving_time;
                            let time = new Number(el.moving_time).secondsToDHM();
                            let trail = (el.distance / 1000 + el.elev_gain.toFixed(0) / 100).toFixed(2);
                            $('div.section.thisweek table tbody').append('<tr ' + (me == '/athletes/' + el.athlete_id ? 'class="you"' : '') + '>' +
                                '<td>' + (i + 1) + '</td>' +
                                '<td class="athlete">' +
                                '<div class= "avatar avatar-athlete avatar-sm">' +
                                '<a class="avatar-content" href="/athletes/' + el.athlete_id + '">' +
                                avatar(el.athlete_id, el.athlete_member_type == 'premium', el.athlete_picture_url, 'sm') +

                                '</a>' +
                                '</div>' +
                                '<a class="athlete-name minimal" href="/athletes/' + el.athlete_id + '">' + el.athlete_firstname + ' ' + el.athlete_lastname + '</a>' +
                                '</td>' +
                                '<td data-order="' + distanceRaw + '">' + distance + ' <abbr class="unit short">km</abbr></td>' +

                                '<td data-order="' + runs + '">' + runs + '</td>' +
                                '<td data-order="' + longestRaw + '">' + longest + ' <abbr class="unit short">km</abbr></td>' +
                                '<td data-order="' + paceRaw + '">' + pace + ' <abbr class="unit short">/km</abbr></td>' +
                                '<td data-order="' + elevation + '">' + elevation + ' <abbr class="unit short">m</abbr></td>' +
                                '<td data-order="' + timeRaw + '">' + time + '</td>' +
                                '<td data-order="' + trail + '">' + trail + '</td>' +
                                '</tr>');
                        });

                        let dtThisweek = new DataTable('div.section.thisweek table', {
                            order: [[2, 'desc']],
                            paging: false,
                            info: false,
                            searching: false,
                            columnDefs: [{
                                targets: [0, 1],
                                orderable: false
                            }, {
                                targets: [2, 3, 4, 6, 7, 8],
                                orderSequence: ["desc"]
                            }, {
                                targets: [5],
                                orderSequence: ["asc"]
                            }],
                            fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                                $('td:eq(0)', nRow).html(iDisplayIndexFull + 1);
                            }
                        });

                        $('div.leaderboard-page div.section:last').after('<div class="section lastweek p0" style="visibility:hidden;"></div>');
                        $('div.section.lastweek').append('<div class="leaderboard"><table class="table table-striped table-hover order-column"><thead><tr><th class="rank">Rank</th><th class="athlete">Athlete</th><th class="distance">Distance</th><th class="runs">Runs</th><th class="longest">Longest</th><th class="pace">Avg. Pace</th><th class="elev">Elev. Gain</th><th class="time">Time</th><th class="trail">Trail Score</th></tr></thead><tbody></tbody></table></div>');

                        $.each(prevWeek, function (i, el) {
                            let distanceRaw = el.distance;
                            let distance = (el.distance / 1000).toFixed(2);
                            let runs = el.num_activities.toFixed(0);
                            let longestRaw = el.best_activities_distance;
                            let longest = (el.best_activities_distance / 1000).toFixed(2);
                            let paceRaw = el.moving_time / (el.distance / 1000);
                            let pace = new Number(el.moving_time / (el.distance / 1000)).secondsToDHM();
                            let elevation = el.elev_gain.toFixed(0);
                            let timeRaw = el.moving_time;
                            let time = new Number(el.moving_time).secondsToDHM();
                            let trail = (el.distance / 1000 + el.elev_gain.toFixed(0) / 100).toFixed(2);
                            $('div.section.lastweek table tbody').append('<tr ' + (me == '/athletes/' + el.athlete_id ? 'class="you"' : '') + '>' +
                                '<td>' + (i + 1) + '</td>' +
                                '<td class="athlete">' +
                                '<div class= "avatar avatar-athlete avatar-sm">' +
                                '<a class="avatar-content" href="/athletes/' + el.athlete_id + '">' +
                                avatar(el.athlete_id, el.athlete_member_type == 'premium', el.athlete_picture_url, 'sm') +

                                '</a>' +
                                '</div>' +
                                '<a class="athlete-name minimal" href="/athletes/' + el.athlete_id + '">' + el.athlete_firstname + ' ' + el.athlete_lastname + '</a>' +
                                '</td>' +
                                '<td data-order="' + distanceRaw + '">' + distance + ' <abbr class="unit short">km</abbr></td>' +

                                '<td data-order="' + runs + '">' + runs + '</td>' +
                                '<td data-order="' + longestRaw + '">' + longest + ' <abbr class="unit short">km</abbr></td>' +
                                '<td data-order="' + paceRaw + '">' + pace + ' <abbr class="unit short">/km</abbr></td>' +
                                '<td data-order="' + elevation + '">' + elevation + ' <abbr class="unit short">m</abbr></td>' +
                                '<td data-order="' + timeRaw + '">' + time + '</td>' +
                                '<td data-order="' + trail + '">' + trail + '</td>' +
                                '</tr>');
                        });

                        let dtPrevweek = new DataTable('div.section.lastweek table', {
                            order: [[2, 'desc']],
                            paging: false,
                            info: false,
                            searching: false,
                            columnDefs: [{
                                targets: [0, 1],
                                orderable: false
                            }, {
                                targets: [2, 3, 4, 6, 7, 8],
                                orderSequence: ["desc"]
                            }, {
                                targets: [5],
                                orderSequence: ["asc"]
                            }],
                            fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                                $('td:eq(0)', nRow).html(iDisplayIndexFull + 1);
                            }
                        });


                        $('div.leaderboard-page div.section:last').after('<div class="section couples p0" style="visibility:hidden;"></div>');
                        $('div.section.couples').append('<div class="leaderboard"><table class="table table-striped table-hover order-column"><thead><tr><th class="rank">Rank</th><th class="athlete">Athletes</th><th class="distance">Distance</th><th class="runs">Runs</th><th class="elev">Elev. Gain</th><th class="time">Time</th><th class="distance">Distance (prev.)</th><th class="runs">Runs (prev.)</th><th class="elev">Elev. Gain (prev.)</th><th class="time">Time (prev.)</th></tr></thead><tbody></tbody></table></div>');

                        $.each(couples, function (i, el) {
                            let el1 = el[0];
                            let el2 = el[1];

                            let el1Now = thisWeek.find(x => x.athlete_id === el1.athlete_id);
                            let el2Now = thisWeek.find(x => x.athlete_id === el2.athlete_id);

                            let distance = ((el1.distance + el2.distance) / 1000).toFixed(2);
                            let runs = (el1.num_activities + el2.num_activities).toFixed(0);
                            let elevation = (el1.elev_gain + el2.elev_gain).toFixed(0);
                            let time = (el1.moving_time + el2.moving_time).toFixed(0);

                            let distanceNow = (((typeof (el1Now) === 'undefined' ? 0 : el1Now.distance) + (typeof (el2Now) === 'undefined' ? 0 : el2Now.distance)) / 1000).toFixed(2);
                            let runsNow = ((typeof (el1Now) === 'undefined' ? 0 : el1Now.num_activities) + (typeof (el2Now) === 'undefined' ? 0 : el2Now.num_activities)).toFixed(0);
                            let elevationNow = ((typeof (el1Now) === 'undefined' ? 0 : el1Now.elev_gain) + (typeof (el2Now) === 'undefined' ? 0 : el2Now.elev_gain)).toFixed(0);
                            let timeNow = ((typeof (el1Now) === 'undefined' ? 0 : el1Now.moving_time) + (typeof (el2Now) === 'undefined' ? 0 : el2Now.moving_time)).toFixed(0);

                            $('div.section.couples table tbody').append('<tr>' +
                                '<td>' + (i + 1) + '</td>' +
                                '<td class="athlete">' +
                                avatar(el1.athlete_id, el1.athlete_member_type == 'premium', el1.athlete_picture_url, 'md') +
                                '<a class="athlete-name minimal" href="/athletes/' + el1.athlete_id + '">' + el1.athlete_firstname + ' ' + el1.athlete_lastname + '</a>' +
                                '<br>' +
                                avatar(el2.athlete_id, el2.athlete_member_type == 'premium', el2.athlete_picture_url, 'sm pdl') +
                                '<a class="athlete-name minimal" href="/athletes/' + el2.athlete_id + '">' + el2.athlete_firstname + ' ' + el2.athlete_lastname + '</a>' +
                                '</td>' +
                                '<td data-order="' + distanceNow + '">' + distanceNow + ' <abbr class="unit short">km</abbr><br><small>' + (typeof (el1Now) === 'undefined' ? 0 : el1Now.distance / 1000).toFixed(2) + ' + ' + (typeof (el2Now) === 'undefined' ? 0 : el2Now.distance / 1000).toFixed(2) + '</small></td>' +
                                '<td data-order="' + runsNow + '">' + runsNow + '<br><small>' + (typeof (el1Now) === 'undefined' ? 0 : el1Now.num_activities).toFixed(0) + ' + ' + (typeof (el2Now) === 'undefined' ? 0 : el2Now.num_activities).toFixed(0) + '<small></td>' +
                                '<td data-order="' + elevationNow + '">' + elevationNow + ' <abbr class="unit short">m</abbr><br><small>' + (typeof (el1Now) === 'undefined' ? 0 : el1Now.elev_gain).toFixed(0) + ' + ' + (typeof (el2Now) === 'undefined' ? 0 : el2Now.elev_gain).toFixed(0) + '</small></td>' +
                                '<td data-order="' + timeNow + '">' + new Number(timeNow).secondsToDHM() + '<br><small>' + (typeof (el1Now) === 'undefined' ? 0 : new Number(el1Now.moving_time)).secondsToDHM() + ' + ' + (typeof (el2Now) === 'undefined' ? 0 : new Number(el2Now.moving_time)).secondsToDHM() + '</small></td>' +
                                '<td data-order="' + distance + '">' + (el1.distance / 1000).toFixed(2) + ' <abbr class="unit short">km</abbr><br>' + (el2.distance / 1000).toFixed(2) + ' <abbr class="unit short">km</abbr></td>' +
                                '<td data-order="' + runs + '">' + el1.num_activities.toFixed(0) + '<br>' + el2.num_activities.toFixed(0) + '</td>' +
                                '<td data-order="' + elevation + '">' + el1.elev_gain.toFixed(0) + ' <abbr class="unit short">m</abbr><br>' + el2.elev_gain.toFixed(0) + ' <abbr class="unit short">m</abbr></td>' +
                                '<td data-order="' + time + '">' + new Number(el1.moving_time).secondsToDHM() + '<br>' + new Number(el2.moving_time).secondsToDHM() + '</td>' +
                                '</tr>');
                        });


                        let dtCouples = new DataTable('div.section.couples table', {
                            order: [[2, 'desc']],
                            paging: false,
                            info: false,
                            searching: false,
                            columnDefs: [{
                                targets: [0, 1],
                                orderable: false
                            }, {
                                targets: [2, 3, 4, 5, 6, 7],
                                orderSequence: ["desc"]
                            }],
                            fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                                $('td:eq(0)', nRow).html(iDisplayIndexFull + 1);
                            }
                        });

                        $(".switches li span.this-week").trigger('click');
                    }
                });
            }
        });
    }
}, 1000);
