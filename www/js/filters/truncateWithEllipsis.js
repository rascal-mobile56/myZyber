angular.module('zyber.filters')
.filter('truncateWithEllipsis', function () {
    return function (value, totalLength) {
        if (!value) return '';

        var max = parseInt(totalLength, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        var part = max/2 - 2;

        var value1 = value.substr(0, part);
        var value2 = value.substr(value.length - part);

        return value1 + '...' + value2;
    };
});