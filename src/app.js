Vue.component('Days', {
    template: '#days-template',
    data: {
        weekDays: ['SU','MO','TU','WE','TH','FR','SA']
    }
})

Vue.component('Months', {
    template: '#months-template'
})

Vue.component('Years', {
    template: '#years-template'
})

var calendar = new Vue({
    el: '#app',
    template: '#calendar-template',

    data: {
        show: false,
        isTitleActive: true,
        format: 'DD/MM/YYYY',
        title: '',
        calendarItems: [],
        currentView: 'Days'
    },

    created: function () {
        this.views = {
            Days: {
                offset: 1,
                items: 'month',
                keyItems: 'day',
                keyNextOffset: 1,
                keyRowOffset: 7
            },

            Months: {
                offset: 1,
                items: 'year',
                keyItems: 'month',
                keyNextOffset: 1,
                keyRowOffset: 3
            },

            Years: {
                offset: 15,
                items: 'year',
                keyItems: 'year',
                keyNextOffset: 1,
                keyRowOffset: 4
            },
        };

        this.date = this.dateStr = moment().format(this.format);

        this.$watch('dateStr', function () {
            this['_fill' + this.currentView]();
        })
    },

    filters: {
        dateValidator: function (val) {
            if (!moment(val, this.format).isValid()) return;

            this.dateStr = val;
            return val;
        }
    },

    computed: {
        date: {
            $set: function (date) { // (String || Object)
                if (typeof date === 'string') {
                    var dayAr = date.split('/');

                    this.day = dayAr[0];
                    this.month = dayAr[1];
                    this.year = dayAr[2];
                } else {
                    Object.keys(date).forEach(function (key) {
                        this[key] = date[key];
                    }, this);
                }
            },
            $get: function () {
                return this.day + '/' + this.month + '/' + this.year;
            }
        },
        moment: function () {
            return moment(this.dateStr, this.format);
        }
    },

    methods: {
        setToday: function () {
            this.date = this.dateStr = moment().format(this.format);
            this.show = false;
        },

        selectItem: function (el) {
            switch (this.currentView) {
                case 'Months':
                    this.date = {month: el.d.slice(3,5), year: el.d.slice(6)}
                    break;
                case 'Years':
                    this.date = {year: el.d.slice(6)}
                    break;
                default:
                    this.date = el.d;
                    break;
            }

            this.dateStr = el.d
            this.prevView();
        },

        nextView: function () {
            this._shiftView(1);
        },

        prevView: function () {
            this._shiftView(-1);
        },

        next: function () {
            var params = this.views[this.currentView];
            this.dateStr = this.moment.add(params.offset, params.items).format(this.format);
        },

        prev: function () {
            var params = this.views[this.currentView];
            this.dateStr = this.moment.subtract(params.offset, params.items).format(this.format);
        },

        // keyboard handlers
        close: function (e) {
            if (!e.relatedTarget ||
                (e.relatedTarget.className != 'calendar-input' &&
                e.relatedTarget.className != 'calendar-btn' &&
                e.relatedTarget.className != 'calendar-main')
            ) this.show = false;
        },

        onEnter: function () {
            this.prevView();
        },

        onTab: function () {
            this.nextView();
        },

        keyNext: function () {
            var params = this.views[this.currentView];
            this.date = this.moment.add(params.keyNextOffset, params.keyItems).format(this.format);
        },

        keyPrev: function () {
            var params = this.views[this.currentView];
            this.date = this.moment.subtract(params.keyNextOffset, params.keyItems).format(this.format);
        },

        keyUp: function () {
            var params = this.views[this.currentView];
            this.date = this.moment.subtract(params.keyRowOffset, params.keyItems).format(this.format);
        },

        keyDown: function () {
            var params = this.views[this.currentView];
            this.date = this.moment.add(params.keyRowOffset, params.keyItems).format(this.format);
        },

        _shiftView: function (offset) {
            var keys = Object.keys(this.views);
                newView = keys[Object.keys(this.views).indexOf(this.currentView) + offset];

            if (offset < 0 && !newView) this.show = false;
            if (!newView) return;

            this.isTitleActive = (newView === 'Years') ? false : true;
            this['_fill' + newView]();
            this.currentView = newView;
        },

        _fillDays: function () {
            var start = this.moment.startOf('month').day(0),
                end = this.moment.endOf('month').day(6),
                month = this.moment.month(),
                self = this;
            this.calendarItems = [];
            this.title = this.moment.format('MMMM YYYY');

            moment()
                .range(start, end)
                .by('days', function(day) {
                    self.calendarItems.push({
                        val: day.format('D'),
                        d: day.format(self.format),
                        isActive: day.month() === month
                    });
                });
        },

        _fillMonths: function() {
            var start = this.moment.startOf('year'),
                end = this.moment.endOf('year'),
                self = this;
            this.calendarItems = [];
            this.title = this.moment.format('YYYY');

            moment()
                .range(start, end)
                .by('months', function(month) {
                    self.calendarItems.push({
                        val: month.format('MMMM'),
                        d: month.format(self.format)
                    });
                });
        },

        _fillYears: function() {
            var year = this.moment.year(),
                self = this,
                floor, ceil, start, end, params;

            function setRange (year) {
                floor = Math.floor(year / 15) * 15,
                ceil = Math.ceil(year / 15) * 15;

                if (floor == ceil) setRange(year - 1);

                return {floor: floor, ceil: ceil};
            }

            params = setRange(year);
            start = this.moment.year(params.floor);
            end = this.moment.year(params.ceil);


            this.calendarItems = [];
            this.title = start.format('YYYY') + '-' + end.format('YYYY');

            moment()
                .range(start, end)
                .by('years', function(year) {
                    self.calendarItems.push({
                        val: year.format('YYYY'),
                        d: year.format(self.format)
                    });
                });
        }
    }
})
