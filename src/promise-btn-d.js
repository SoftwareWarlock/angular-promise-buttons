angular.module('angularPromiseButtons')
    .directive('promiseBtn', ['angularPromiseButtons', '$rootScope', function (angularPromiseButtons, $rootScope)
    {
        'use strict';

        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                promiseBtn: '=',
                ngClick: '@',
                btnSpinnerClass: '@'
            },
            templateUrl: 'promise-btn-d.html',
            link: function (scope, el, attrs)
            {
                var cfg = angularPromiseButtons.config,
                    ev = {
                        loading: 'LOADING',
                        loadingStopped: 'LOADING_STOPPED'
                    };

                function makeFunc(func, funcName)
                {
                    $rootScope.$on(cfg.eventPrefix + '_' + funcName + '_' + ev.loading, loading);
                    $rootScope.$on(cfg.eventPrefix + '_' + funcName + '_' + ev.loadingStopped, loadingFinished);

                    return function ()
                    {
                        var curPromise = func.apply(this, arguments);
                        if (curPromise && curPromise.then) {
                            $rootScope.$broadcast(cfg.eventPrefix + '_' + funcName + '_' + ev.loading);
                            curPromise.then(function ()
                            {
                                $rootScope.$broadcast(cfg.eventPrefix + '_' + funcName + '_' + ev.loadingStopped);
                            }, function ()
                            {
                                $rootScope.$broadcast(cfg.eventPrefix + '_' + funcName + '_' + ev.loadingStopped);
                            });
                        }
                    };
                }

                function loading()
                {
                    if (cfg.btnLoadingClass) {
                        el.addClass(cfg.btnLoadingClass);
                    }
                    if (cfg.disableBtn) {
                        el.attr('disabled', 'disabled');
                    }
                }

                function loadingFinished()
                {
                    if (cfg.btnLoadingClass) {
                        el.removeClass(cfg.btnLoadingClass);
                    }
                    if (cfg.disableBtn) {
                        el.attr('disabled', '');
                    }
                }


                // append spinner
                el.append(cfg.spinnerTpl);


                // wrap function
                if (!attrs.promiseBtn && scope.ngClick) {
                    var funcName = scope.ngClick.replace(/\([^\)]*\)/, '');
                    var func = scope.$parent.$parent[funcName];
                    scope.$parent.$parent[funcName] = makeFunc(func, funcName);

                }
                // simple watch
                else {
                    scope.$watch(function ()
                    {
                        return scope.promiseBtn;
                    }, function (mVal)
                    {
                        if (mVal && mVal.then) {
                            loading();
                            mVal.then(loadingFinished, loadingFinished);
                        }
                    });
                }
            }
        };
    }]);
