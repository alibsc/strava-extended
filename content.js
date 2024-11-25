const getDateOfYear = (date) =>
    Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0)) / 864e5);

const percentageChange = (a, b) => (b / a * 100) - 100;

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

        $('div.spans11').toggleClass('spans11 spans16');

        if ($('li.total-club-km').length == 0) {
            if ($('ul.inline-stats').length == 1) {
                $('ul.inline-stats').append('<li style="width:100px;"></li><li class="total-club-km">&nbsp;</li><li class="total-club-elev">&nbsp;</li>');
            } else {
                $('#leaderboard-heading').after('<div class="athlete-rank mt-sm mb-sm"><ul class="inline-stats"><li class="total-club-km">&nbsp;</li><li class="total-club-elev">&nbsp;</li></ul></div>');
            }
        }

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
                    'raw': $(el).html()
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
                                el.distance = $value.text();
                                el.distanceOrder = parseFloat($value.text().replace(' km', '').replace(',', ''));
                                el.avgMonth = (parseFloat($value.text().replace(' km', '').replace(',', '')) / getDateOfYear(new Date()) * 30).toFixed(2);
                                el.avgWeek = (parseFloat($value.text().replace(' km', '').replace(',', '')) / getDateOfYear(new Date()) * 7).toFixed(2);
                            }
                            if ($name.text() == 'Time') {
                                el.time = $value.text();
                                el.timeOrder = parseFloat($value.text().replace('h ', '.').replace('m', ''));
                            }
                            if ($name.text() == 'Elev Gain') {
                                el.elev = $value.text();
                                el.elevOrder = parseFloat($value.text().replace(' m', '').replace(',', ''));
                            }
                        });
                        el.avgDistance = (el.distanceOrder / el.activities).toFixed(2);

                        let a = (el.timeOrder).toString().split('.');
                        let sec = (+a[0]) * 60 * 60;
                        if (a[1] > 0) {
                            sec += (+a[1]) * 60;
                        }
                        el.avgPaceOrder = (sec * (1 / el.distanceOrder) / 60).toFixed(2);

                        let b = (el.avgPaceOrder).toString().split('.');
                        let min = (+b[0]);
                        let sec2 = (+b[1]);
                        el.avgPace = min + ':' + (sec2 == 0 ? '00' : ("0" + (sec2 / 100 * 60).toFixed(0)).slice(-2));

                        parsed++;
                    });
                });

                $.each(members, function (i, el) {
                    let urlPrev = el.href + '/profile_sidebar_comparison?hl=en-US&ytd_year=2023';
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

                        $('div.leaderboard-page div.section:last').after('<div class="section year"><h2 class="topless leaderboard-type">This Year\'s Leaderboard</h2></div>');
                        $('div.section.year').append('<div class="leaderboard"><table class="table table-striped table-hover order-column"><thead><tr><th class="rank">Rank</th><th class="athlete">Athlete</th><th class="distance">Distance</th><th class="elev">Elev. Gain</th><th class="avg-month">Avg. Month</th><th class="avg-week">Avg. Week</th><th class="avg-week">Avg. Pace</th><th class="avg-week">Avg. Distance</th><th class="activities hidden-xs">Activities</th><th class="time hidden-xs">Time</th></tr></thead><tbody></tbody></table></div>');

                        $.each(members, function (i, el) {
                            el.distanceDifference = percentageChange(el.distancePrevOrder, ((el.distanceOrder / getDateOfYear(new Date())) * 365)).toFixed(2);
                            el.elevDifference = percentageChange(el.elevPrevOrder, ((el.elevOrder / getDateOfYear(new Date())) * 365)).toFixed(2);
                            $('div.section.year table tbody').append('<tr>' +
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
                                '<td data-order="' + el.avgMonth + '">' + el.avgMonth + ' km</td>' +
                                '<td data-order="' + el.avgWeek + '">' + el.avgWeek + ' km</td>' +
                                '<td data-order="' + el.avgPaceOrder + '">' + el.avgPace + ' min/km</td>' +
                                '<td data-order="' + el.avgDistance + '">' + el.avgDistance + ' km</td>' +
                                '<td>' + el.activities + '</td>' +
                                '<td data-order="' + el.timeOrder + '">' + el.time + '</td>' +
                                '</tr>');
                        });

                        let targets = [2, 3, 4, 5, 6, 7];

                        let dt = new DataTable('div.section.year table', {
                            order: [[2, 'desc']],
                            paging: false,
                            info: false,
                            searching: false,
                            columnDefs: [{
                                targets: [0, 1],
                                orderable: false
                            }, {
                                targets: targets,
                                orderSequence: ["desc", "asc"]
                            }],
                            fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                                $('td:eq(0)', nRow).html(iDisplayIndexFull + 1);
                            }
                        });

                    }
                }, 100);
            }
        });

        let prevWeek = [];
        let thisWeek = [];
        let couples = [];

        $.ajax({
            url: window.location.href + '/leaderboard?week_offset=1',
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
                    url: window.location.href + '/leaderboard',
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
                        });

                        $('li.total-club-km').html('<strong>' + (totalKm / 1000).toFixed(2) + ' <abbr class="unit short">km</abbr></strong><div class="label">Club Distance</div>');
                        $('li.total-club-elev').html('<strong>' + totalElev.toFixed(0) + ' <abbr class="unit short">m</abbr></strong><div class="label">Club Elevation</div>');

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

                        $('div.leaderboard-page div.section:last').after('<div class="section couples"><h2 class="topless leaderboard-type">Fellows Leaderboard</h2></div>');
                        $('div.section.couples').append('<div class="leaderboard"><table class="table table-striped table-hover order-column"><thead><tr><th class="rank">Rank</th><th class="athlete">Athletes</th><th class="distance">Distance</th><th class="runs">Runs</th><th class="elev">Elev. Gain</th><th class="distance">Distance (prev.)</th><th class="runs">Runs (prev.)</th><th class="elev">Elev. Gain (prev.)</th></tr></thead><tbody></tbody></table></div>');

                        $.each(couples, function (i, el) {
                            let el1 = el[0];
                            let el2 = el[1];

                            let el1Now = thisWeek.find(x => x.athlete_id === el1.athlete_id);
                            let el2Now = thisWeek.find(x => x.athlete_id === el2.athlete_id);

                            let distance = ((el1.distance + el2.distance) / 1000).toFixed(2);
                            let runs = (el1.num_activities + el2.num_activities).toFixed(0);
                            let elevation = (el1.elev_gain + el2.elev_gain).toFixed(0);

                            let distanceNow = (((typeof (el1Now) === 'undefined' ? 0 : el1Now.distance) + (typeof (el2Now) === 'undefined' ? 0 : el2Now.distance)) / 1000).toFixed(2);
                            let runsNow = ((typeof (el1Now) === 'undefined' ? 0 : el1Now.num_activities) + (typeof (el2Now) === 'undefined' ? 0 : el2Now.num_activities)).toFixed(0);
                            let elevationNow = ((typeof (el1Now) === 'undefined' ? 0 : el1Now.elev_gain) + (typeof (el2Now) === 'undefined' ? 0 : el2Now.elev_gain)).toFixed(0);

                            $('div.section.couples table tbody').append('<tr>' +
                                '<td>' + (i + 1) + '</td>' +
                                '<td class="athlete">' +
                                avatar(el1.athlete_id, el1.athlete_member_type == 'premium', el1.athlete_picture_url, 'md') +
                                '<a class="athlete-name minimal" href="/athletes/' + el1.athlete_id + '">' + el1.athlete_firstname + ' ' + el1.athlete_lastname + '</a>' +
                                '<br>' +
                                avatar(el2.athlete_id, el2.athlete_member_type == 'premium', el2.athlete_picture_url, 'sm pdl') +
                                '<a class="athlete-name minimal" href="/athletes/' + el2.athlete_id + '">' + el2.athlete_firstname + ' ' + el2.athlete_lastname + '</a>' +
                                '</td>' +
                                '<td data-order="' + distanceNow + '">' + distanceNow + ' km<br><small>' + (typeof (el1Now) === 'undefined' ? 0 : el1Now.distance / 1000).toFixed(2) + ' + ' + (typeof (el2Now) === 'undefined' ? 0 : el2Now.distance / 1000).toFixed(2) + '</small></td>' +
                                '<td data-order="' + runsNow + '">' + runsNow + '<br><small>' + (typeof (el1Now) === 'undefined' ? 0 : el1Now.num_activities).toFixed(0) + ' + ' + (typeof (el2Now) === 'undefined' ? 0 : el2Now.num_activities).toFixed(0) + '<small></td>' +
                                '<td data-order="' + elevationNow + '">' + elevationNow + ' m<br><small>' + (typeof (el1Now) === 'undefined' ? 0 : el1Now.elev_gain).toFixed(0) + ' + ' + (typeof (el2Now) === 'undefined' ? 0 : el2Now.elev_gain).toFixed(0) + '</small></td>' +
                                '<td data-order="' + distance + '">' + (el1.distance / 1000).toFixed(2) + ' km<br>' + (el2.distance / 1000).toFixed(2) + ' km</td>' +
                                '<td data-order="' + runs + '">' + el1.num_activities.toFixed(0) + '<br>' + el2.num_activities.toFixed(0) + '</td>' +
                                '<td data-order="' + elevation + '">' + el1.elev_gain.toFixed(0) + ' m<br>' + el2.elev_gain.toFixed(0) + ' m</td>' +
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
                    }
                });
            }
        });
    }
}, 1000);
