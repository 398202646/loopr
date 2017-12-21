const AppConfigMixin = (superclass) => class extends superclass {
    constructor() {
        super();
    }

    computeMarketId(tokenx, tokeny) {
        return this.appConfig.computeMarketId(tokenx, tokeny);
    }

    getTokenByName(tokenName) {
        if (tokenName) {
            return this.appConfig.tokenMap[tokenName.toUpperCase()];
        }
    }
    getMarket(marketKey) {
        if (marketKey) {
            let marketArr = marketKey.split("-");
            if (marketArr.length === 2) {
                let marketId = this.computeMarketId(marketArr[0].toUpperCase(), marketArr[1].toUpperCase());
                let market = this.appConfig.marketMap[marketId];
                if (!market) {
                    return null;
                } else {
                    return market;
                }
            } else {
                console.error("Not supported market: " + marketKey)
                return null;
            }
        } else {
            console.error("Not supported market: " + marketKey)
            return null;
        }
    }

    toNumber(str, tokenConfig) {
        return (new BigNumber(str))
            .dividedBy(new BigNumber(10).toPower(tokenConfig.digits))
            .toNumber();
    };

    _numberFormat(value, digits, precision) {
        if (digits && precision) {
            if (value > 0) {
                let v = value / Math.pow(10, digits);
                return v.toFixed(precision);
            } else {
                return "0." + "0".repeat(precision);
            }
        } else {
            return 0;
        }
    }

    _pager() {
        let pager = this.$.pager;
        if (pager) {
            Array.prototype.forEach.call(pager.shadowRoot.querySelectorAll('a'), (item) => {
                item.addEventListener('click', this._pageClick.bind(this));
                item.href = "javascript:void(0)";
            });
        }
    }

    _pageClick(e) {
        if ("general first" === e.target.className) {
            this.currentPage = 1;
        } else if ("general previous" === e.target.className) {
            this.currentPage = this.currentPage - 1;
        } else if ("general" === e.target.className) {
            this.currentPage = Number(e.target.textContent);
        } else if ("general next" === e.target.className) {
            this.currentPage = this.currentPage + 1;
        } else if ("general last" === e.target.className) {
            this.currentPage = this.totalPage;
        } else {
            return;
        }
        this._pager();
    }

    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
    // 例子：
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    _dateFormat(date, fmt) {
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    _computeUrl(settingsRelay) {
        if (settingsRelay) {
            return settingsRelay + "/rpc"
        }
    }

    _computeUrlParameters(route, thisPage) {
        if (route && route.path && thisPage) {
            let parameters = route.path.split("/");
            if (parameters[1] && thisPage === parameters[1]) {
                this.page = parameters[1];
                if (parameters[2]) {
                    this.subpage = parameters[2];
                }
                if (parameters[3]) {
                    this.third = parameters[3];
                }
            }
        }
    }

    _returnParameters(route) {
        if (route && route.path) {
            let parameters = route.path.split("/");
            let result = {};
            if (parameters[1]) {
                result.page = parameters[1];
            }
            if (parameters[2]) {
                result.subpage = parameters[2];
            }
            if (parameters[3]) {
                result.third = parameters[3];
            }
            return result;
        }
    }

    _calculatePrice(appConfig, tokenx, tokeny, amountx, amounty) {
        if (appConfig && tokenx && tokeny && amountx && amounty) {
            let tempx = tokenx.toUpperCase();
            let tempy = tokeny.toUpperCase();
            let market = appConfig.computeMarketByTokens(tempx, tempy);
            if (market) {
                if (market.tokenx === tempx) {
                    //console.log(tokenx+"("+Number(amountx)+")->"+tokeny+"("+Number(amounty)+") = "+(amounty / amountx));
                    return amounty / amountx;
                } else {
                    //console.log(tokenx+"("+Number(amountx)+")->"+tokeny+"("+Number(amounty)+") = "+(amountx / amounty))
                    return amountx / amounty;
                }
            } else {
                let tempArr = new Array();
                tempArr.push(tempx);
                tempArr.push(tempy);
                let sortedArr = _.sortBy(tempArr, [function(o) { return o; }]);
                if (sortedArr[0] === tempx) {
                    return amountx / amounty;
                } else {
                    return amounty / amountx;
                }
            }
        }
    }

    _calculatePricePrecision(appConfig, tokenx, tokeny) {
        if (appConfig && tokenx && tokeny) {
            let tempx = tokenx.toUpperCase();
            let tempy = tokeny.toUpperCase();
            let market = appConfig.computeMarketByTokens(tempx, tempy);
            if (market) {
                return market.pricePrecision;
            } else {
                return appConfig.marketConfig.defaultPricePrecision;
            }
        }
    }
}