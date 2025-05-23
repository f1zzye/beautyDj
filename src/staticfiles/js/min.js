! function(d) {
    var n = {
        url: !1,
        callback: !1,
        target: !1,
        duration: 120,
        on: "mouseover",
        touch: !0,
        onZoomIn: !1,
        onZoomOut: !1,
        magnify: 1
    };
    d.zoom = function(o, t, e, n) {
        var i, u, c, a, r, m, l, f = d(o),
            s = f.css("position"),
            h = d(t);
        return o.style.position = /(absolute|fixed)/.test(s) ? s : "relative", o.style.overflow = "hidden", e.style.width = e.style.height = "", d(e).addClass("zoomImg").css({
            position: "absolute",
            top: 0,
            left: 0,
            opacity: 0,
            width: e.width * n,
            height: e.height * n,
            border: "none",
            maxWidth: "none",
            maxHeight: "none"
        }).appendTo(o), {
            init: function() {
                u = f.outerWidth(), i = f.outerHeight(), c = t === o ? (a = u, i) : (a = h.outerWidth(), h.outerHeight()), r = (e.width - u) / a, m = (e.height - i) / c, l = h.offset()
            },
            move: function(o) {
                var t = o.pageX - l.left,
                    o = o.pageY - l.top,
                    o = Math.max(Math.min(o, c), 0),
                    t = Math.max(Math.min(t, a), 0);
                e.style.left = t * -r + "px", e.style.top = o * -m + "px"
            }
        }
    }, d.fn.zoom = function(e) {
        return this.each(function() {
            var i = d.extend({}, n, e || {}),
                u = i.target && d(i.target)[0] || this,
                o = this,
                c = d(o),
                a = document.createElement("img"),
                r = d(a),
                m = "mousemove.zoom",
                l = !1,
                f = !1;
            if (!i.url) {
                var t = o.querySelector("img");
                if (t && (i.url = t.getAttribute("data-src") || t.currentSrc || t.src), !i.url) return
            }
            c.one("zoom.destroy", function(o, t) {
                c.off(".zoom"), u.style.position = o, u.style.overflow = t, a.onload = null, r.remove()
            }.bind(this, u.style.position, u.style.overflow)), a.onload = function() {
                var t = d.zoom(u, o, a, i.magnify);

                function e(o) {
                    t.init(), t.move(o), r.stop().fadeTo(d.support.opacity ? i.duration : 0, 1, "function" == typeof i.onZoomIn && i.onZoomIn.call(a))
                }

                function n() {
                    r.stop().fadeTo(i.duration, 0, "function" == typeof i.onZoomOut && i.onZoomOut.call(a))
                }
                "grab" === i.on ? c.on("mousedown.zoom", function(o) {
                    1 === o.which && (d(document).one("mouseup.zoom", function() {
                        n(), d(document).off(m, t.move)
                    }), e(o), d(document).on(m, t.move), o.preventDefault())
                }) : "click" === i.on ? c.on("click.zoom", function(o) {
                    if (!l) return l = !0, e(o), d(document).on(m, t.move), d(document).one("click.zoom", function() {
                        n(), l = !1, d(document).off(m, t.move)
                    }), !1
                }) : "toggle" === i.on ? c.on("click.zoom", function(o) {
                    l ? n() : e(o), l = !l
                }) : "mouseover" === i.on && (t.init(), c.on("mouseenter.zoom", e).on("mouseleave.zoom", n).on(m, t.move)), i.touch && c.on("touchstart.zoom", function(o) {
                    o.preventDefault(), f ? (f = !1, n()) : (f = !0, e(o.originalEvent.touches[0] || o.originalEvent.changedTouches[0]))
                }).on("touchmove.zoom", function(o) {
                    o.preventDefault(), t.move(o.originalEvent.touches[0] || o.originalEvent.changedTouches[0])
                }).on("touchend.zoom", function(o) {
                    o.preventDefault(), f && (f = !1, n())
                }), "function" == typeof i.callback && i.callback.call(a)
            }, a.setAttribute("role", "presentation"), a.alt = "", a.src = i.url
        })
    }, d.fn.zoom.defaults = n
}(window.jQuery);
! function(h, i, s, a) {
    function l(t, e) {
        this.settings = null, this.options = h.extend({}, l.Defaults, e), this.$element = h(t), this._handlers = {}, this._plugins = {}, this._supress = {}, this._current = null, this._speed = null, this._coordinates = [], this._breakpoint = null, this._width = null, this._items = [], this._clones = [], this._mergers = [], this._widths = [], this._invalidated = {}, this._pipe = [], this._drag = {
            time: null,
            target: null,
            pointer: null,
            stage: {
                start: null,
                current: null
            },
            direction: null
        }, this._states = {
            current: {},
            tags: {
                initializing: ["busy"],
                animating: ["busy"],
                dragging: ["interacting"]
            }
        }, h.each(["onResize", "onThrottledResize"], h.proxy(function(t, e) {
            this._handlers[e] = h.proxy(this[e], this)
        }, this)), h.each(l.Plugins, h.proxy(function(t, e) {
            this._plugins[t.charAt(0).toLowerCase() + t.slice(1)] = new e(this)
        }, this)), h.each(l.Workers, h.proxy(function(t, e) {
            this._pipe.push({
                filter: e.filter,
                run: h.proxy(e.run, this)
            })
        }, this)), this.setup(), this.initialize()
    }
    l.Defaults = {
        items: 3,
        loop: !1,
        center: !1,
        rewind: !1,
        checkVisibility: !0,
        mouseDrag: !0,
        touchDrag: !0,
        pullDrag: !0,
        freeDrag: !1,
        margin: 0,
        stagePadding: 0,
        merge: !1,
        mergeFit: !0,
        autoWidth: !1,
        startPosition: 0,
        rtl: !1,
        smartSpeed: 250,
        fluidSpeed: !1,
        dragEndSpeed: !1,
        responsive: {},
        responsiveRefreshRate: 200,
        responsiveBaseElement: i,
        fallbackEasing: "swing",
        slideTransition: "",
        info: !1,
        nestedItemSelector: !1,
        itemElement: "div",
        stageElement: "div",
        refreshClass: "owl-refresh",
        loadedClass: "owl-loaded",
        loadingClass: "owl-loading",
        rtlClass: "owl-rtl",
        responsiveClass: "owl-responsive",
        dragClass: "owl-drag",
        itemClass: "owl-item",
        stageClass: "owl-stage",
        stageOuterClass: "owl-stage-outer",
        grabClass: "owl-grab"
    }, l.Width = {
        Default: "default",
        Inner: "inner",
        Outer: "outer"
    }, l.Type = {
        Event: "event",
        State: "state"
    }, l.Plugins = {}, l.Workers = [{
        filter: ["width", "settings"],
        run: function() {
            this._width = this.$element.width()
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function(t) {
            t.current = this._items && this._items[this.relative(this._current)]
        }
    }, {
        filter: ["items", "settings"],
        run: function() {
            this.$stage.children(".cloned").remove()
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function(t) {
            var e = this.settings.margin || "",
                i = !this.settings.autoWidth,
                s = this.settings.rtl,
                e = {
                    width: "auto",
                    "margin-left": s ? e : "",
                    "margin-right": s ? "" : e
                };
            i || this.$stage.children().css(e), t.css = e
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function(t) {
            var e = (this.width() / this.settings.items).toFixed(3) - this.settings.margin,
                i = null,
                s = this._items.length,
                n = !this.settings.autoWidth,
                o = [];
            for (t.items = {
                    merge: !1,
                    width: e
                }; s--;) i = this._mergers[s], i = this.settings.mergeFit && Math.min(i, this.settings.items) || i, t.items.merge = 1 < i || t.items.merge, o[s] = n ? e * i : this._items[s].width();
            this._widths = o
        }
    }, {
        filter: ["items", "settings"],
        run: function() {
            var t = [],
                e = this._items,
                i = this.settings,
                s = Math.max(2 * i.items, 4),
                n = 2 * Math.ceil(e.length / 2),
                o = i.loop && e.length ? i.rewind ? s : Math.max(s, n) : 0,
                r = "",
                a = "";
            for (o /= 2; 0 < o;) t.push(this.normalize(t.length / 2, !0)), r += e[t[t.length - 1]][0].outerHTML, t.push(this.normalize(e.length - 1 - (t.length - 1) / 2, !0)), a = e[t[t.length - 1]][0].outerHTML + a, --o;
            this._clones = t, h(r).addClass("cloned").appendTo(this.$stage), h(a).addClass("cloned").prependTo(this.$stage)
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function() {
            for (var t, e, i = this.settings.rtl ? 1 : -1, s = this._clones.length + this._items.length, n = -1, o = []; ++n < s;) t = o[n - 1] || 0, e = this._widths[this.relative(n)] + this.settings.margin, o.push(t + e * i);
            this._coordinates = o
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function() {
            var t = this.settings.stagePadding,
                e = this._coordinates,
                t = {
                    width: Math.ceil(Math.abs(e[e.length - 1])) + 2 * t,
                    "padding-left": t || "",
                    "padding-right": t || ""
                };
            this.$stage.css(t)
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function(t) {
            var e = this._coordinates.length,
                i = !this.settings.autoWidth,
                s = this.$stage.children();
            if (i && t.items.merge)
                for (; e--;) t.css.width = this._widths[this.relative(e)], s.eq(e).css(t.css);
            else i && (t.css.width = t.items.width, s.css(t.css))
        }
    }, {
        filter: ["items"],
        run: function() {
            this._coordinates.length < 1 && this.$stage.removeAttr("style")
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function(t) {
            t.current = t.current ? this.$stage.children().index(t.current) : 0, t.current = Math.max(this.minimum(), Math.min(this.maximum(), t.current)), this.reset(t.current)
        }
    }, {
        filter: ["position"],
        run: function() {
            var t = this.coordinates(this._current);
            this.animate(t)
        }
    }, {
        filter: ["width", "position", "items", "settings"],
        run: function() {
            for (var t, e, i = this.settings.rtl ? 1 : -1, s = 2 * this.settings.stagePadding, n = this.coordinates(this.current()) + s, o = n + this.width() * i, r = [], a = 0, h = this._coordinates.length; a < h; a++) t = this._coordinates[a - 1] || 0, e = Math.abs(this._coordinates[a]) + s * i, (this.op(t, "<=", n) && this.op(t, ">", o) || this.op(e, "<", n) && this.op(e, ">", o)) && r.push(a);
            this.$stage.children(".active").removeClass("active"), this.$stage.children(":eq(" + r.join("), :eq(") + ")").addClass("active"), this.$stage.children(".center").removeClass("center"), this.settings.center && this.$stage.children().eq(this.current()).addClass("center")
        }
    }], l.prototype.initializeStage = function() {
        this.$stage = this.$element.find("." + this.settings.stageClass), this.$stage.length || (this.$element.addClass(this.options.loadingClass), this.$stage = h("<" + this.settings.stageElement + ">", {
            class: this.settings.stageClass
        }).wrap(h("<div/>", {
            class: this.settings.stageOuterClass
        })), this.$element.append(this.$stage.parent()))
    }, l.prototype.initializeItems = function() {
        var t = this.$element.find(".owl-item");
        if (t.length) return this._items = t.get().map(function(t) {
            return h(t)
        }), this._mergers = this._items.map(function() {
            return 1
        }), void this.refresh();
        this.replace(this.$element.children().not(this.$stage.parent())), this.isVisible() ? this.refresh() : this.invalidate("width"), this.$element.removeClass(this.options.loadingClass).addClass(this.options.loadedClass)
    }, l.prototype.initialize = function() {
        var t, e;
        this.enter("initializing"), this.trigger("initialize"), this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl), this.settings.autoWidth && !this.is("pre-loading") && (t = this.$element.find("img"), e = this.settings.nestedItemSelector ? "." + this.settings.nestedItemSelector : a, e = this.$element.children(e).width(), t.length && e <= 0 && this.preloadAutoWidthImages(t)), this.initializeStage(), this.initializeItems(), this.registerEventHandlers(), this.leave("initializing"), this.trigger("initialized")
    }, l.prototype.isVisible = function() {
        return !this.settings.checkVisibility || this.$element.is(":visible")
    }, l.prototype.setup = function() {
        var e = this.viewport(),
            t = this.options.responsive,
            i = -1,
            s = null;
        t ? (h.each(t, function(t) {
            t <= e && i < t && (i = Number(t))
        }), "function" == typeof(s = h.extend({}, this.options, t[i])).stagePadding && (s.stagePadding = s.stagePadding()), delete s.responsive, s.responsiveClass && this.$element.attr("class", this.$element.attr("class").replace(new RegExp("(" + this.options.responsiveClass + "-)\\S+\\s", "g"), "$1" + i))) : s = h.extend({}, this.options), this.trigger("change", {
            property: {
                name: "settings",
                value: s
            }
        }), this._breakpoint = i, this.settings = s, this.invalidate("settings"), this.trigger("changed", {
            property: {
                name: "settings",
                value: this.settings
            }
        })
    }, l.prototype.optionsLogic = function() {
        this.settings.autoWidth && (this.settings.stagePadding = !1, this.settings.merge = !1)
    }, l.prototype.prepare = function(t) {
        var e = this.trigger("prepare", {
            content: t
        });
        return e.data || (e.data = h("<" + this.settings.itemElement + "/>").addClass(this.options.itemClass).append(t)), this.trigger("prepared", {
            content: e.data
        }), e.data
    }, l.prototype.update = function() {
        for (var t = 0, e = this._pipe.length, i = h.proxy(function(t) {
                return this[t]
            }, this._invalidated), s = {}; t < e;)(this._invalidated.all || 0 < h.grep(this._pipe[t].filter, i).length) && this._pipe[t].run(s), t++;
        this._invalidated = {}, this.is("valid") || this.enter("valid")
    }, l.prototype.width = function(t) {
        switch (t = t || l.Width.Default) {
            case l.Width.Inner:
            case l.Width.Outer:
                return this._width;
            default:
                return this._width - 2 * this.settings.stagePadding + this.settings.margin
        }
    }, l.prototype.refresh = function() {
        this.enter("refreshing"), this.trigger("refresh"), this.setup(), this.optionsLogic(), this.$element.addClass(this.options.refreshClass), this.update(), this.$element.removeClass(this.options.refreshClass), this.leave("refreshing"), this.trigger("refreshed")
    }, l.prototype.onThrottledResize = function() {
        i.clearTimeout(this.resizeTimer), this.resizeTimer = i.setTimeout(this._handlers.onResize, this.settings.responsiveRefreshRate)
    }, l.prototype.onResize = function() {
        return !!this._items.length && (this._width !== this.$element.width() && (!!this.isVisible() && (this.enter("resizing"), this.trigger("resize").isDefaultPrevented() ? (this.leave("resizing"), !1) : (this.invalidate("width"), this.refresh(), this.leave("resizing"), void this.trigger("resized")))))
    }, l.prototype.registerEventHandlers = function() {
        h.support.transition && this.$stage.on(h.support.transition.end + ".owl.core", h.proxy(this.onTransitionEnd, this)), !1 !== this.settings.responsive && this.on(i, "resize", this._handlers.onThrottledResize), this.settings.mouseDrag && (this.$element.addClass(this.options.dragClass), this.$stage.on("mousedown.owl.core", h.proxy(this.onDragStart, this)), this.$stage.on("dragstart.owl.core selectstart.owl.core", function() {
            return !1
        })), this.settings.touchDrag && (this.$stage.on("touchstart.owl.core", h.proxy(this.onDragStart, this)), this.$stage.on("touchcancel.owl.core", h.proxy(this.onDragEnd, this)))
    }, l.prototype.onDragStart = function(t) {
        var e = null;
        3 !== t.which && (e = h.support.transform ? {
            x: (e = this.$stage.css("transform").replace(/.*\(|\)| /g, "").split(","))[16 === e.length ? 12 : 4],
            y: e[16 === e.length ? 13 : 5]
        } : (e = this.$stage.position(), {
            x: this.settings.rtl ? e.left + this.$stage.width() - this.width() + this.settings.margin : e.left,
            y: e.top
        }), this.is("animating") && (h.support.transform ? this.animate(e.x) : this.$stage.stop(), this.invalidate("position")), this.$element.toggleClass(this.options.grabClass, "mousedown" === t.type), this.speed(0), this._drag.time = (new Date).getTime(), this._drag.target = h(t.target), this._drag.stage.start = e, this._drag.stage.current = e, this._drag.pointer = this.pointer(t), h(s).on("mouseup.owl.core touchend.owl.core", h.proxy(this.onDragEnd, this)), h(s).one("mousemove.owl.core touchmove.owl.core", h.proxy(function(t) {
            var e = this.difference(this._drag.pointer, this.pointer(t));
            h(s).on("mousemove.owl.core touchmove.owl.core", h.proxy(this.onDragMove, this)), Math.abs(e.x) < Math.abs(e.y) && this.is("valid") || (t.preventDefault(), this.enter("dragging"), this.trigger("drag"))
        }, this)))
    }, l.prototype.onDragMove = function(t) {
        var e = null,
            i = null,
            s = this.difference(this._drag.pointer, this.pointer(t)),
            n = this.difference(this._drag.stage.start, s);
        this.is("dragging") && (t.preventDefault(), this.settings.loop ? (e = this.coordinates(this.minimum()), i = this.coordinates(this.maximum() + 1) - e, n.x = ((n.x - e) % i + i) % i + e) : (e = this.settings.rtl ? this.coordinates(this.maximum()) : this.coordinates(this.minimum()), i = this.settings.rtl ? this.coordinates(this.minimum()) : this.coordinates(this.maximum()), s = this.settings.pullDrag ? -1 * s.x / 5 : 0, n.x = Math.max(Math.min(n.x, e + s), i + s)), this._drag.stage.current = n, this.animate(n.x))
    }, l.prototype.onDragEnd = function(t) {
        var e = this.difference(this._drag.pointer, this.pointer(t)),
            i = this._drag.stage.current,
            t = 0 < e.x ^ this.settings.rtl ? "left" : "right";
        h(s).off(".owl.core"), this.$element.removeClass(this.options.grabClass), (0 !== e.x && this.is("dragging") || !this.is("valid")) && (this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed), this.current(this.closest(i.x, 0 !== e.x ? t : this._drag.direction)), this.invalidate("position"), this.update(), this._drag.direction = t, (3 < Math.abs(e.x) || 300 < (new Date).getTime() - this._drag.time) && this._drag.target.one("click.owl.core", function() {
            return !1
        })), this.is("dragging") && (this.leave("dragging"), this.trigger("dragged"))
    }, l.prototype.closest = function(i, s) {
        var n = -1,
            o = this.width(),
            r = this.coordinates();
        return this.settings.freeDrag || h.each(r, h.proxy(function(t, e) {
            return "left" === s && e - 30 < i && i < e + 30 ? n = t : "right" === s && e - o - 30 < i && i < e - o + 30 ? n = t + 1 : this.op(i, "<", e) && this.op(i, ">", r[t + 1] !== a ? r[t + 1] : e - o) && (n = "left" === s ? t + 1 : t), -1 === n
        }, this)), this.settings.loop || (this.op(i, ">", r[this.minimum()]) ? n = i = this.minimum() : this.op(i, "<", r[this.maximum()]) && (n = i = this.maximum())), n
    }, l.prototype.animate = function(t) {
        var e = 0 < this.speed();
        this.is("animating") && this.onTransitionEnd(), e && (this.enter("animating"), this.trigger("translate")), h.support.transform3d && h.support.transition ? this.$stage.css({
            transform: "translate3d(" + t + "px,0px,0px)",
            transition: this.speed() / 1e3 + "s" + (this.settings.slideTransition ? " " + this.settings.slideTransition : "")
        }) : e ? this.$stage.animate({
            left: t + "px"
        }, this.speed(), this.settings.fallbackEasing, h.proxy(this.onTransitionEnd, this)) : this.$stage.css({
            left: t + "px"
        })
    }, l.prototype.is = function(t) {
        return this._states.current[t] && 0 < this._states.current[t]
    }, l.prototype.current = function(t) {
        return t === a ? this._current : 0 === this._items.length ? a : (t = this.normalize(t), this._current !== t && ((e = this.trigger("change", {
            property: {
                name: "position",
                value: t
            }
        })).data !== a && (t = this.normalize(e.data)), this._current = t, this.invalidate("position"), this.trigger("changed", {
            property: {
                name: "position",
                value: this._current
            }
        })), this._current);
        var e
    }, l.prototype.invalidate = function(t) {
        return "string" == typeof t && (this._invalidated[t] = !0, this.is("valid") && this.leave("valid")), h.map(this._invalidated, function(t, e) {
            return e
        })
    }, l.prototype.reset = function(t) {
        (t = this.normalize(t)) !== a && (this._speed = 0, this._current = t, this.suppress(["translate", "translated"]), this.animate(this.coordinates(t)), this.release(["translate", "translated"]))
    }, l.prototype.normalize = function(t, e) {
        var i = this._items.length,
            e = e ? 0 : this._clones.length;
        return !this.isNumeric(t) || i < 1 ? t = a : (t < 0 || i + e <= t) && (t = ((t - e / 2) % i + i) % i + e / 2), t
    }, l.prototype.relative = function(t) {
        return t -= this._clones.length / 2, this.normalize(t, !0)
    }, l.prototype.maximum = function(t) {
        var e, i, s, n = this.settings,
            o = this._coordinates.length;
        if (n.loop) o = this._clones.length / 2 + this._items.length - 1;
        else if (n.autoWidth || n.merge) {
            if (e = this._items.length)
                for (i = this._items[--e].width(), s = this.$element.width(); e-- && !(s < (i += this._items[e].width() + this.settings.margin)););
            o = e + 1
        } else o = n.center ? this._items.length - 1 : this._items.length - n.items;
        return t && (o -= this._clones.length / 2), Math.max(o, 0)
    }, l.prototype.minimum = function(t) {
        return t ? 0 : this._clones.length / 2
    }, l.prototype.items = function(t) {
        return t === a ? this._items.slice() : (t = this.normalize(t, !0), this._items[t])
    }, l.prototype.mergers = function(t) {
        return t === a ? this._mergers.slice() : (t = this.normalize(t, !0), this._mergers[t])
    }, l.prototype.clones = function(i) {
        function s(t) {
            return t % 2 == 0 ? n + t / 2 : e - (t + 1) / 2
        }
        var e = this._clones.length / 2,
            n = e + this._items.length;
        return i === a ? h.map(this._clones, function(t, e) {
            return s(e)
        }) : h.map(this._clones, function(t, e) {
            return t === i ? s(e) : null
        })
    }, l.prototype.speed = function(t) {
        return t !== a && (this._speed = t), this._speed
    }, l.prototype.coordinates = function(t) {
        var e, i = 1,
            s = t - 1;
        return t === a ? h.map(this._coordinates, h.proxy(function(t, e) {
            return this.coordinates(e)
        }, this)) : (this.settings.center ? (this.settings.rtl && (i = -1, s = t + 1), e = this._coordinates[t], e += (this.width() - e + (this._coordinates[s] || 0)) / 2 * i) : e = this._coordinates[s] || 0, e = Math.ceil(e))
    }, l.prototype.duration = function(t, e, i) {
        return 0 === i ? 0 : Math.min(Math.max(Math.abs(e - t), 1), 6) * Math.abs(i || this.settings.smartSpeed)
    }, l.prototype.to = function(t, e, i) {
        var s = this.current(),
            n = t - this.relative(s),
            o = (0 < n) - (n < 0),
            r = this._items.length,
            a = this.minimum(),
            h = this.maximum(),
            l = r - h;
        this.settings.loop ? (!this.settings.rewind && Math.abs(n) > r / 2 && (n += -1 * o * r), (r = (((t = s + n) - a) % r + r) % r + a) !== t && r - n <= h && 0 < r - n && this.reset(s = (t = r) - n)) : this.settings.rewind ? t = (t % (h += 1) + h) % h : (!0 !== i && (1 == l || (2 == l ? t === s && 0 < s && (t = s - 1) : t -= Math.round(l / 2) - 1)), (t = h < t ? h : t) < a && (t = a)), this.speed(this.duration(s, t, e)), this.current(t), this.isVisible() && this.update()
    }, l.prototype.next = function(t) {
        t = t || !1, this.to(this.relative(this.current()) + 1, t, !0)
    }, l.prototype.prev = function(t) {
        t = t || !1, this.to(this.relative(this.current()) - 1, t, !0)
    }, l.prototype.onTransitionEnd = function(t) {
        if (t !== a && (t.stopPropagation(), (t.target || t.srcElement || t.originalTarget) !== this.$stage.get(0))) return !1;
        this.leave("animating"), this.trigger("translated")
    }, l.prototype.viewport = function() {
        var t;
        return this.options.responsiveBaseElement !== i ? t = h(this.options.responsiveBaseElement).width() : i.innerWidth ? t = i.innerWidth : s.documentElement && s.documentElement.clientWidth ? t = s.documentElement.clientWidth : console.warn("Can not detect viewport width."), t
    }, l.prototype.replace = function(t) {
        this.$stage.empty(), this._items = [], t = t && (t instanceof jQuery ? t : h(t)), (t = this.settings.nestedItemSelector ? t.find("." + this.settings.nestedItemSelector) : t).filter(function() {
            return 1 === this.nodeType
        }).each(h.proxy(function(t, e) {
            e = this.prepare(e), this.$stage.append(e), this._items.push(e), this._mergers.push(+e.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1)
        }, this)), this.reset(this.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0), this.invalidate("items")
    }, l.prototype.add = function(t, e) {
        var i = this.relative(this._current);
        e = e === a ? this._items.length : this.normalize(e, !0), t = t instanceof jQuery ? t : h(t), this.trigger("add", {
            content: t,
            position: e
        }), t = this.prepare(t), 0 === this._items.length || e === this._items.length ? (0 === this._items.length && this.$stage.append(t), 0 !== this._items.length && this._items[e - 1].after(t), this._items.push(t), this._mergers.push(+t.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1)) : (this._items[e].before(t), this._items.splice(e, 0, t), this._mergers.splice(e, 0, +t.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1)), this._items[i] && this.reset(this._items[i].index()), this.invalidate("items"), this.trigger("added", {
            content: t,
            position: e
        })
    }, l.prototype.remove = function(t) {
        (t = this.normalize(t, !0)) !== a && (this.trigger("remove", {
            content: this._items[t],
            position: t
        }), this._items[t].remove(), this._items.splice(t, 1), this._mergers.splice(t, 1), this.invalidate("items"), this.trigger("removed", {
            content: null,
            position: t
        }))
    }, l.prototype.preloadAutoWidthImages = function(t) {
        t.each(h.proxy(function(t, e) {
            this.enter("pre-loading"), e = h(e), h(new Image).one("load", h.proxy(function(t) {
                e.attr("src", t.target.src), e.css("opacity", 1), this.leave("pre-loading"), this.is("pre-loading") || this.is("initializing") || this.refresh()
            }, this)).attr("src", e.attr("src") || e.attr("data-src") || e.attr("data-src-retina"))
        }, this))
    }, l.prototype.destroy = function() {
        for (var t in this.$element.off(".owl.core"), this.$stage.off(".owl.core"), h(s).off(".owl.core"), !1 !== this.settings.responsive && (i.clearTimeout(this.resizeTimer), this.off(i, "resize", this._handlers.onThrottledResize)), this._plugins) this._plugins[t].destroy();
        this.$stage.children(".cloned").remove(), this.$stage.unwrap(), this.$stage.children().contents().unwrap(), this.$stage.children().unwrap(), this.$stage.remove(), this.$element.removeClass(this.options.refreshClass).removeClass(this.options.loadingClass).removeClass(this.options.loadedClass).removeClass(this.options.rtlClass).removeClass(this.options.dragClass).removeClass(this.options.grabClass).attr("class", this.$element.attr("class").replace(new RegExp(this.options.responsiveClass + "-\\S+\\s", "g"), "")).removeData("owl.carousel")
    }, l.prototype.op = function(t, e, i) {
        var s = this.settings.rtl;
        switch (e) {
            case "<":
                return s ? i < t : t < i;
            case ">":
                return s ? t < i : i < t;
            case ">=":
                return s ? t <= i : i <= t;
            case "<=":
                return s ? i <= t : t <= i
        }
    }, l.prototype.on = function(t, e, i, s) {
        t.addEventListener ? t.addEventListener(e, i, s) : t.attachEvent && t.attachEvent("on" + e, i)
    }, l.prototype.off = function(t, e, i, s) {
        t.removeEventListener ? t.removeEventListener(e, i, s) : t.detachEvent && t.detachEvent("on" + e, i)
    }, l.prototype.trigger = function(t, e, i, s, n) {
        var o = {
                item: {
                    count: this._items.length,
                    index: this.current()
                }
            },
            r = h.camelCase(h.grep(["on", t, i], function(t) {
                return t
            }).join("-").toLowerCase()),
            a = h.Event([t, "owl", i || "carousel"].join(".").toLowerCase(), h.extend({
                relatedTarget: this
            }, o, e));
        return this._supress[t] || (h.each(this._plugins, function(t, e) {
            e.onTrigger && e.onTrigger(a)
        }), this.register({
            type: l.Type.Event,
            name: t
        }), this.$element.trigger(a), this.settings && "function" == typeof this.settings[r] && this.settings[r].call(this, a)), a
    }, l.prototype.enter = function(t) {
        h.each([t].concat(this._states.tags[t] || []), h.proxy(function(t, e) {
            this._states.current[e] === a && (this._states.current[e] = 0), this._states.current[e]++
        }, this))
    }, l.prototype.leave = function(t) {
        h.each([t].concat(this._states.tags[t] || []), h.proxy(function(t, e) {
            this._states.current[e]--
        }, this))
    }, l.prototype.register = function(i) {
        var e;
        i.type === l.Type.Event ? (h.event.special[i.name] || (h.event.special[i.name] = {}), h.event.special[i.name].owl || (e = h.event.special[i.name]._default, h.event.special[i.name]._default = function(t) {
            return !e || !e.apply || t.namespace && -1 !== t.namespace.indexOf("owl") ? t.namespace && -1 < t.namespace.indexOf("owl") : e.apply(this, arguments)
        }, h.event.special[i.name].owl = !0)) : i.type === l.Type.State && (this._states.tags[i.name] ? this._states.tags[i.name] = this._states.tags[i.name].concat(i.tags) : this._states.tags[i.name] = i.tags, this._states.tags[i.name] = h.grep(this._states.tags[i.name], h.proxy(function(t, e) {
            return h.inArray(t, this._states.tags[i.name]) === e
        }, this)))
    }, l.prototype.suppress = function(t) {
        h.each(t, h.proxy(function(t, e) {
            this._supress[e] = !0
        }, this))
    }, l.prototype.release = function(t) {
        h.each(t, h.proxy(function(t, e) {
            delete this._supress[e]
        }, this))
    }, l.prototype.pointer = function(t) {
        var e = {
            x: null,
            y: null
        };
        return (t = (t = t.originalEvent || t || i.event).touches && t.touches.length ? t.touches[0] : t.changedTouches && t.changedTouches.length ? t.changedTouches[0] : t).pageX ? (e.x = t.pageX, e.y = t.pageY) : (e.x = t.clientX, e.y = t.clientY), e
    }, l.prototype.isNumeric = function(t) {
        return !isNaN(parseFloat(t))
    }, l.prototype.difference = function(t, e) {
        return {
            x: t.x - e.x,
            y: t.y - e.y
        }
    }, h.fn.owlCarousel = function(e) {
        var s = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            var t = h(this),
                i = t.data("owl.carousel");
            i || (i = new l(this, "object" == typeof e && e), t.data("owl.carousel", i), h.each(["next", "prev", "to", "destroy", "refresh", "replace", "add", "remove"], function(t, e) {
                i.register({
                    type: l.Type.Event,
                    name: e
                }), i.$element.on(e + ".owl.carousel.core", h.proxy(function(t) {
                    t.namespace && t.relatedTarget !== this && (this.suppress([e]), i[e].apply(this, [].slice.call(arguments, 1)), this.release([e]))
                }, i))
            })), "string" == typeof e && "_" !== e.charAt(0) && i[e].apply(i, s)
        })
    }, h.fn.owlCarousel.Constructor = l
}(window.Zepto || window.jQuery, window, document),
function(e, i) {
    function s(t) {
        this._core = t, this._interval = null, this._visible = null, this._handlers = {
            "initialized.owl.carousel": e.proxy(function(t) {
                t.namespace && this._core.settings.autoRefresh && this.watch()
            }, this)
        }, this._core.options = e.extend({}, s.Defaults, this._core.options), this._core.$element.on(this._handlers)
    }
    s.Defaults = {
        autoRefresh: !0,
        autoRefreshInterval: 500
    }, s.prototype.watch = function() {
        this._interval || (this._visible = this._core.isVisible(), this._interval = i.setInterval(e.proxy(this.refresh, this), this._core.settings.autoRefreshInterval))
    }, s.prototype.refresh = function() {
        this._core.isVisible() !== this._visible && (this._visible = !this._visible, this._core.$element.toggleClass("owl-hidden", !this._visible), this._visible && this._core.invalidate("width") && this._core.refresh())
    }, s.prototype.destroy = function() {
        var t, e;
        for (t in i.clearInterval(this._interval), this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, e.fn.owlCarousel.Constructor.Plugins.AutoRefresh = s
}(window.Zepto || window.jQuery, window, document),
function(a, n) {
    function e(t) {
        this._core = t, this._loaded = [], this._handlers = {
            "initialized.owl.carousel change.owl.carousel resized.owl.carousel": a.proxy(function(t) {
                if (t.namespace && this._core.settings && this._core.settings.lazyLoad && (t.property && "position" == t.property.name || "initialized" == t.type)) {
                    var e = this._core.settings,
                        i = e.center && Math.ceil(e.items / 2) || e.items,
                        s = e.center && -1 * i || 0,
                        n = (t.property && void 0 !== t.property.value ? t.property.value : this._core.current()) + s,
                        o = this._core.clones().length,
                        r = a.proxy(function(t, e) {
                            this.load(e)
                        }, this);
                    for (0 < e.lazyLoadEager && (i += e.lazyLoadEager, e.loop && (n -= e.lazyLoadEager, i++)); s++ < i;) this.load(o / 2 + this._core.relative(n)), o && a.each(this._core.clones(this._core.relative(n)), r), n++
                }
            }, this)
        }, this._core.options = a.extend({}, e.Defaults, this._core.options), this._core.$element.on(this._handlers)
    }
    e.Defaults = {
        lazyLoad: !1,
        lazyLoadEager: 0
    }, e.prototype.load = function(t) {
        var e = this._core.$stage.children().eq(t),
            t = e && e.find(".owl-lazy");
        !t || -1 < a.inArray(e.get(0), this._loaded) || (t.each(a.proxy(function(t, e) {
            var i = a(e),
                s = 1 < n.devicePixelRatio && i.attr("data-src-retina") || i.attr("data-src") || i.attr("data-srcset");
            this._core.trigger("load", {
                element: i,
                url: s
            }, "lazy"), i.is("img") ? i.one("load.owl.lazy", a.proxy(function() {
                i.css("opacity", 1), this._core.trigger("loaded", {
                    element: i,
                    url: s
                }, "lazy")
            }, this)).attr("src", s) : i.is("source") ? i.one("load.owl.lazy", a.proxy(function() {
                this._core.trigger("loaded", {
                    element: i,
                    url: s
                }, "lazy")
            }, this)).attr("srcset", s) : ((e = new Image).onload = a.proxy(function() {
                i.css({
                    "background-image": 'url("' + s + '")',
                    opacity: "1"
                }), this._core.trigger("loaded", {
                    element: i,
                    url: s
                }, "lazy")
            }, this), e.src = s)
        }, this)), this._loaded.push(e.get(0)))
    }, e.prototype.destroy = function() {
        var t, e;
        for (t in this.handlers) this._core.$element.off(t, this.handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, a.fn.owlCarousel.Constructor.Plugins.Lazy = e
}(window.Zepto || window.jQuery, window, document),
function(n, i, s) {
    function o(t) {
        this._core = t, this._previousHeight = null, this._handlers = {
            "initialized.owl.carousel refreshed.owl.carousel": n.proxy(function(t) {
                t.namespace && this._core.settings.autoHeight && this.update()
            }, this),
            "changed.owl.carousel": n.proxy(function(t) {
                t.namespace && this._core.settings.autoHeight && "position" === t.property.name && this.update()
            }, this),
            "loaded.owl.lazy": n.proxy(function(t) {
                t.namespace && this._core.settings.autoHeight && t.element.closest("." + this._core.settings.itemClass).index() === this._core.current() && this.update()
            }, this)
        }, this._core.options = n.extend({}, o.Defaults, this._core.options), this._core.$element.on(this._handlers), this._intervalId = null;
        var e = this;
        "loading" === s.readyState && n(i).on("load", function() {
            e._core.settings.autoHeight && e.update()
        }), n(i).on("resize", function() {
            e._core.settings.autoHeight && (null != e._intervalId && clearTimeout(e._intervalId), e._intervalId = setTimeout(function() {
                e.update()
            }, 250))
        })
    }
    o.Defaults = {
        autoHeight: !1,
        autoHeightClass: "owl-height"
    }, o.prototype.update = function() {
        var t = this._core._current,
            e = t + this._core.settings.items,
            i = this._core.settings.lazyLoad,
            t = this._core.$stage.children().toArray().slice(t, e),
            s = [],
            e = 0;
        n.each(t, function(t, e) {
            s.push(n(e).height())
        }), (e = Math.max.apply(null, s)) <= 1 && i && this._previousHeight && (e = this._previousHeight), this._previousHeight = e, this._core.$stage.parent().height(e).addClass(this._core.settings.autoHeightClass)
    }, o.prototype.destroy = function() {
        var t, e;
        for (t in this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, n.fn.owlCarousel.Constructor.Plugins.AutoHeight = o
}(window.Zepto || window.jQuery, window, document),
function(c, e) {
    function i(t) {
        this._core = t, this._videos = {}, this._playing = null, this._handlers = {
            "initialized.owl.carousel": c.proxy(function(t) {
                t.namespace && this._core.register({
                    type: "state",
                    name: "playing",
                    tags: ["interacting"]
                })
            }, this),
            "resize.owl.carousel": c.proxy(function(t) {
                t.namespace && this._core.settings.video && this.isInFullScreen() && t.preventDefault()
            }, this),
            "refreshed.owl.carousel": c.proxy(function(t) {
                t.namespace && this._core.is("resizing") && this._core.$stage.find(".cloned .owl-video-frame").remove()
            }, this),
            "changed.owl.carousel": c.proxy(function(t) {
                t.namespace && "position" === t.property.name && this._playing && this.stop()
            }, this),
            "prepared.owl.carousel": c.proxy(function(t) {
                var e;
                !t.namespace || (e = c(t.content).find(".owl-video")).length && (e.css("display", "none"), this.fetch(e, c(t.content)))
            }, this)
        }, this._core.options = c.extend({}, i.Defaults, this._core.options), this._core.$element.on(this._handlers), this._core.$element.on("click.owl.video", ".owl-video-play-icon", c.proxy(function(t) {
            this.play(t)
        }, this))
    }
    i.Defaults = {
        video: !1,
        videoHeight: !1,
        videoWidth: !1
    }, i.prototype.fetch = function(t, e) {
        var i = t.attr("data-vimeo-id") ? "vimeo" : t.attr("data-vzaar-id") ? "vzaar" : "youtube",
            s = t.attr("data-vimeo-id") || t.attr("data-youtube-id") || t.attr("data-vzaar-id"),
            n = t.attr("data-width") || this._core.settings.videoWidth,
            o = t.attr("data-height") || this._core.settings.videoHeight,
            r = t.attr("href");
        if (!r) throw new Error("Missing video URL.");
        if (-1 < (s = r.match(/(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|be\-nocookie\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/))[3].indexOf("youtu")) i = "youtube";
        else if (-1 < s[3].indexOf("vimeo")) i = "vimeo";
        else {
            if (!(-1 < s[3].indexOf("vzaar"))) throw new Error("Video URL not supported.");
            i = "vzaar"
        }
        s = s[6], this._videos[r] = {
            type: i,
            id: s,
            width: n,
            height: o
        }, e.attr("data-video", r), this.thumbnail(t, this._videos[r])
    }, i.prototype.thumbnail = function(e, t) {
        function i(t) {
            s = l.lazyLoad ? c("<div/>", {
                class: "owl-video-tn " + h,
                srcType: t
            }) : c("<div/>", {
                class: "owl-video-tn",
                style: "opacity:1;background-image:url(" + t + ")"
            }), e.after(s), e.after('<div class="owl-video-play-icon"></div>')
        }
        var s, n, o = t.width && t.height ? "width:" + t.width + "px;height:" + t.height + "px;" : "",
            r = e.find("img"),
            a = "src",
            h = "",
            l = this._core.settings;
        if (e.wrap(c("<div/>", {
                class: "owl-video-wrapper",
                style: o
            })), this._core.settings.lazyLoad && (a = "data-src", h = "owl-lazy"), r.length) return i(r.attr(a)), r.remove(), !1;
        "youtube" === t.type ? (n = "//img.youtube.com/vi/" + t.id + "/hqdefault.jpg", i(n)) : "vimeo" === t.type ? c.ajax({
            type: "GET",
            url: "//vimeo.com/api/v2/video/" + t.id + ".json",
            jsonp: "callback",
            dataType: "jsonp",
            success: function(t) {
                n = t[0].thumbnail_large, i(n)
            }
        }) : "vzaar" === t.type && c.ajax({
            type: "GET",
            url: "//vzaar.com/api/videos/" + t.id + ".json",
            jsonp: "callback",
            dataType: "jsonp",
            success: function(t) {
                n = t.framegrab_url, i(n)
            }
        })
    }, i.prototype.stop = function() {
        this._core.trigger("stop", null, "video"), this._playing.find(".owl-video-frame").remove(), this._playing.removeClass("owl-video-playing"), this._playing = null, this._core.leave("playing"), this._core.trigger("stopped", null, "video")
    }, i.prototype.play = function(t) {
        var e = c(t.target).closest("." + this._core.settings.itemClass),
            i = this._videos[e.attr("data-video")],
            s = i.width || "100%",
            n = i.height || this._core.$stage.height();
        this._playing || (this._core.enter("playing"), this._core.trigger("play", null, "video"), e = this._core.items(this._core.relative(e.index())), this._core.reset(e.index()), (t = c('<iframe frameborder="0" allowfullscreen mozallowfullscreen webkitAllowFullScreen ></iframe>')).attr("height", n), t.attr("width", s), "youtube" === i.type ? t.attr("src", "//www.youtube.com/embed/" + i.id + "?autoplay=1&rel=0&v=" + i.id) : "vimeo" === i.type ? t.attr("src", "//player.vimeo.com/video/" + i.id + "?autoplay=1") : "vzaar" === i.type && t.attr("src", "//view.vzaar.com/" + i.id + "/player?autoplay=true"), c(t).wrap('<div class="owl-video-frame" />').insertAfter(e.find(".owl-video")), this._playing = e.addClass("owl-video-playing"))
    }, i.prototype.isInFullScreen = function() {
        var t = e.fullscreenElement || e.mozFullScreenElement || e.webkitFullscreenElement;
        return t && c(t).parent().hasClass("owl-video-frame")
    }, i.prototype.destroy = function() {
        var t, e;
        for (t in this._core.$element.off("click.owl.video"), this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, c.fn.owlCarousel.Constructor.Plugins.Video = i
}(window.Zepto || window.jQuery, (window, document)),
function(r) {
    function e(t) {
        this.core = t, this.core.options = r.extend({}, e.Defaults, this.core.options), this.swapping = !0, this.previous = void 0, this.next = void 0, this.handlers = {
            "change.owl.carousel": r.proxy(function(t) {
                t.namespace && "position" == t.property.name && (this.previous = this.core.current(), this.next = t.property.value)
            }, this),
            "drag.owl.carousel dragged.owl.carousel translated.owl.carousel": r.proxy(function(t) {
                t.namespace && (this.swapping = "translated" == t.type)
            }, this),
            "translate.owl.carousel": r.proxy(function(t) {
                t.namespace && this.swapping && (this.core.options.animateOut || this.core.options.animateIn) && this.swap()
            }, this)
        }, this.core.$element.on(this.handlers)
    }
    e.Defaults = {
        animateOut: !1,
        animateIn: !1
    }, e.prototype.swap = function() {
        var t, e, i, s, n, o;
        1 === this.core.settings.items && r.support.animation && r.support.transition && (this.core.speed(0), e = r.proxy(this.clear, this), i = this.core.$stage.children().eq(this.previous), s = this.core.$stage.children().eq(this.next), n = this.core.settings.animateIn, o = this.core.settings.animateOut, this.core.current() !== this.previous && (o && (t = this.core.coordinates(this.previous) - this.core.coordinates(this.next), i.one(r.support.animation.end, e).css({
            left: t + "px"
        }).addClass("animated owl-animated-out").addClass(o)), n && s.one(r.support.animation.end, e).addClass("animated owl-animated-in").addClass(n)))
    }, e.prototype.clear = function(t) {
        r(t.target).css({
            left: ""
        }).removeClass("animated owl-animated-out owl-animated-in").removeClass(this.core.settings.animateIn).removeClass(this.core.settings.animateOut), this.core.onTransitionEnd()
    }, e.prototype.destroy = function() {
        var t, e;
        for (t in this.handlers) this.core.$element.off(t, this.handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, r.fn.owlCarousel.Constructor.Plugins.Animate = e
}(window.Zepto || window.jQuery, (window, document)),
function(s, n, e) {
    function i(t) {
        this._core = t, this._call = null, this._time = 0, this._timeout = 0, this._paused = !0, this._handlers = {
            "changed.owl.carousel": s.proxy(function(t) {
                t.namespace && "settings" === t.property.name ? this._core.settings.autoplay ? this.play() : this.stop() : t.namespace && "position" === t.property.name && this._paused && (this._time = 0)
            }, this),
            "initialized.owl.carousel": s.proxy(function(t) {
                t.namespace && this._core.settings.autoplay && this.play()
            }, this),
            "play.owl.autoplay": s.proxy(function(t, e, i) {
                t.namespace && this.play(e, i)
            }, this),
            "stop.owl.autoplay": s.proxy(function(t) {
                t.namespace && this.stop()
            }, this),
            "mouseover.owl.autoplay": s.proxy(function() {
                this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.pause()
            }, this),
            "mouseleave.owl.autoplay": s.proxy(function() {
                this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.play()
            }, this),
            "touchstart.owl.core": s.proxy(function() {
                this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.pause()
            }, this),
            "touchend.owl.core": s.proxy(function() {
                this._core.settings.autoplayHoverPause && this.play()
            }, this)
        }, this._core.$element.on(this._handlers), this._core.options = s.extend({}, i.Defaults, this._core.options)
    }
    i.Defaults = {
        autoplay: !1,
        autoplayTimeout: 5e3,
        autoplayHoverPause: !1,
        autoplaySpeed: !1
    }, i.prototype._next = function(t) {
        this._call = n.setTimeout(s.proxy(this._next, this, t), this._timeout * (Math.round(this.read() / this._timeout) + 1) - this.read()), this._core.is("interacting") || e.hidden || this._core.next(t || this._core.settings.autoplaySpeed)
    }, i.prototype.read = function() {
        return (new Date).getTime() - this._time
    }, i.prototype.play = function(t, e) {
        var i;
        this._core.is("rotating") || this._core.enter("rotating"), t = t || this._core.settings.autoplayTimeout, i = Math.min(this._time % (this._timeout || t), t), this._paused ? (this._time = this.read(), this._paused = !1) : n.clearTimeout(this._call), this._time += this.read() % t - i, this._timeout = t, this._call = n.setTimeout(s.proxy(this._next, this, e), t - i)
    }, i.prototype.stop = function() {
        this._core.is("rotating") && (this._time = 0, this._paused = !0, n.clearTimeout(this._call), this._core.leave("rotating"))
    }, i.prototype.pause = function() {
        this._core.is("rotating") && !this._paused && (this._time = this.read(), this._paused = !0, n.clearTimeout(this._call))
    }, i.prototype.destroy = function() {
        var t, e;
        for (t in this.stop(), this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, s.fn.owlCarousel.Constructor.Plugins.autoplay = i
}(window.Zepto || window.jQuery, window, document),
function(n) {
    "use strict";

    function e(t) {
        this._core = t, this._initialized = !1, this._pages = [], this._controls = {}, this._templates = [], this.$element = this._core.$element, this._overrides = {
            next: this._core.next,
            prev: this._core.prev,
            to: this._core.to
        }, this._handlers = {
            "prepared.owl.carousel": n.proxy(function(t) {
                t.namespace && this._core.settings.dotsData && this._templates.push('<div class="' + this._core.settings.dotClass + '">' + n(t.content).find("[data-dot]").addBack("[data-dot]").attr("data-dot") + "</div>")
            }, this),
            "added.owl.carousel": n.proxy(function(t) {
                t.namespace && this._core.settings.dotsData && this._templates.splice(t.position, 0, this._templates.pop())
            }, this),
            "remove.owl.carousel": n.proxy(function(t) {
                t.namespace && this._core.settings.dotsData && this._templates.splice(t.position, 1)
            }, this),
            "changed.owl.carousel": n.proxy(function(t) {
                t.namespace && "position" == t.property.name && this.draw()
            }, this),
            "initialized.owl.carousel": n.proxy(function(t) {
                t.namespace && !this._initialized && (this._core.trigger("initialize", null, "navigation"), this.initialize(), this.update(), this.draw(), this._initialized = !0, this._core.trigger("initialized", null, "navigation"))
            }, this),
            "refreshed.owl.carousel": n.proxy(function(t) {
                t.namespace && this._initialized && (this._core.trigger("refresh", null, "navigation"), this.update(), this.draw(), this._core.trigger("refreshed", null, "navigation"))
            }, this)
        }, this._core.options = n.extend({}, e.Defaults, this._core.options), this.$element.on(this._handlers)
    }
    e.Defaults = {
        nav: !1,
        navText: ['<span aria-label="Previous">&#x2039;</span>', '<span aria-label="Next">&#x203a;</span>'],
        navSpeed: !1,
        navElement: 'button type="button" role="presentation"',
        navContainer: !1,
        navContainerClass: "owl-nav",
        navClass: ["owl-prev", "owl-next"],
        slideBy: 1,
        dotClass: "owl-dot",
        dotsClass: "owl-dots",
        dots: !0,
        dotsEach: !1,
        dotsData: !1,
        dotsSpeed: !1,
        dotsContainer: !1
    }, e.prototype.initialize = function() {
        var t, i = this._core.settings;
        for (t in this._controls.$relative = (i.navContainer ? n(i.navContainer) : n("<div>").addClass(i.navContainerClass).appendTo(this.$element)).addClass("disabled"), this._controls.$previous = n("<" + i.navElement + ">").addClass(i.navClass[0]).html(i.navText[0]).prependTo(this._controls.$relative).on("click", n.proxy(function(t) {
                this.prev(i.navSpeed)
            }, this)), this._controls.$next = n("<" + i.navElement + ">").addClass(i.navClass[1]).html(i.navText[1]).appendTo(this._controls.$relative).on("click", n.proxy(function(t) {
                this.next(i.navSpeed)
            }, this)), i.dotsData || (this._templates = [n('<button role="button">').addClass(i.dotClass).append(n("<span>")).prop("outerHTML")]), this._controls.$absolute = (i.dotsContainer ? n(i.dotsContainer) : n("<div>").addClass(i.dotsClass).appendTo(this.$element)).addClass("disabled"), this._controls.$absolute.on("click", "button", n.proxy(function(t) {
                var e = (n(t.target).parent().is(this._controls.$absolute) ? n(t.target) : n(t.target).parent()).index();
                t.preventDefault(), this.to(e, i.dotsSpeed, !1, !0)
            }, this)), this._overrides) this._core[t] = n.proxy(this[t], this)
    }, e.prototype.destroy = function() {
        var t, e, i, s, n = this._core.settings;
        for (t in this._handlers) this.$element.off(t, this._handlers[t]);
        for (e in this._controls) "$relative" === e && n.navContainer ? this._controls[e].html("") : this._controls[e].remove();
        for (s in this.overides) this._core[s] = this._overrides[s];
        for (i in Object.getOwnPropertyNames(this)) "function" != typeof this[i] && (this[i] = null)
    }, e.prototype.update = function() {
        var t, e, i = this._core.clones().length / 2,
            s = i + this._core.items().length,
            n = this._core.maximum(!0),
            o = this._core.settings,
            r = o.center || o.autoWidth || o.dotsData ? 1 : o.dotsEach || o.items;
        if ("page" !== o.slideBy && (o.slideBy = Math.min(o.slideBy, o.items)), o.dots || "page" == o.slideBy)
            for (this._pages = [], t = i, e = 0; t < s; t++) {
                if (r <= e || 0 === e) {
                    if (this._pages.push({
                            start: Math.min(n, t - i),
                            end: t - i + r - 1
                        }), Math.min(n, t - i) === n) break;
                    e = 0, 0
                }
                e += this._core.mergers(this._core.relative(t))
            }
    }, e.prototype.draw = function() {
        var t = this._core.settings,
            e = this._core.items().length <= t.items,
            i = this._core.relative(this._core.current()),
            s = t.loop || t.rewind;
        this._controls.$relative.toggleClass("disabled", !t.nav || e), t.nav && (this._controls.$previous.toggleClass("disabled", !s && i <= this._core.minimum(!0)), this._controls.$next.toggleClass("disabled", !s && i >= this._core.maximum(!0))), this._controls.$absolute.toggleClass("disabled", !t.dots || e), t.dots && (e = this._pages.length - this._controls.$absolute.children().length, t.dotsData && 0 != e ? this._controls.$absolute.html(this._templates.join("")) : 0 < e ? this._controls.$absolute.append(new Array(1 + e).join(this._templates[0])) : e < 0 && this._controls.$absolute.children().slice(e).remove(), this._controls.$absolute.find(".active").removeClass("active"), this._controls.$absolute.children().eq(n.inArray(this.current(), this._pages)).addClass("active"))
    }, e.prototype.onTrigger = function(t) {
        var e = this._core.settings;
        t.page = {
            index: n.inArray(this.current(), this._pages),
            count: this._pages.length,
            size: e && (e.center || e.autoWidth || e.dotsData ? 1 : e.dotsEach || e.items)
        }
    }, e.prototype.current = function() {
        var i = this._core.relative(this._core.current());
        return n.grep(this._pages, n.proxy(function(t, e) {
            return t.start <= i && t.end >= i
        }, this)).pop()
    }, e.prototype.getPosition = function(t) {
        var e, i, s = this._core.settings;
        return "page" == s.slideBy ? (e = n.inArray(this.current(), this._pages), i = this._pages.length, t ? ++e : --e, e = this._pages[(e % i + i) % i].start) : (e = this._core.relative(this._core.current()), i = this._core.items().length, t ? e += s.slideBy : e -= s.slideBy), e
    }, e.prototype.next = function(t) {
        n.proxy(this._overrides.to, this._core)(this.getPosition(!0), t, !0)
    }, e.prototype.prev = function(t) {
        n.proxy(this._overrides.to, this._core)(this.getPosition(!1), t, !0)
    }, e.prototype.to = function(t, e, i, s) {
        !i && this._pages.length ? (i = this._pages.length, n.proxy(this._overrides.to, this._core)(this._pages[(t % i + i) % i].start, e, s)) : n.proxy(this._overrides.to, this._core)(t, e, s)
    }, n.fn.owlCarousel.Constructor.Plugins.Navigation = e
}(window.Zepto || window.jQuery, (window, document)),
function(s, n) {
    "use strict";

    function e(t) {
        this._core = t, this._hashes = {}, this.$element = this._core.$element, this._handlers = {
            "initialized.owl.carousel": s.proxy(function(t) {
                t.namespace && "URLHash" === this._core.settings.startPosition && s(n).trigger("hashchange.owl.navigation")
            }, this),
            "prepared.owl.carousel": s.proxy(function(t) {
                var e;
                !t.namespace || (e = s(t.content).find("[data-hash]").addBack("[data-hash]").attr("data-hash")) && (this._hashes[e] = t.content)
            }, this),
            "changed.owl.carousel": s.proxy(function(t) {
                var i;
                t.namespace && "position" === t.property.name && (i = this._core.items(this._core.relative(this._core.current())), (t = s.map(this._hashes, function(t, e) {
                    return t === i ? e : null
                }).join()) && n.location.hash.slice(1) !== t && (n.location.hash = t))
            }, this)
        }, this._core.options = s.extend({}, e.Defaults, this._core.options), this.$element.on(this._handlers), s(n).on("hashchange.owl.navigation", s.proxy(function(t) {
            var e = n.location.hash.substring(1),
                i = this._core.$stage.children(),
                e = this._hashes[e] && i.index(this._hashes[e]);
            void 0 !== e && e !== this._core.current() && this._core.to(this._core.relative(e), !1, !0)
        }, this))
    }
    e.Defaults = {
        URLhashListener: !1
    }, e.prototype.destroy = function() {
        var t, e;
        for (t in s(n).off("hashchange.owl.navigation"), this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null)
    }, s.fn.owlCarousel.Constructor.Plugins.Hash = e
}(window.Zepto || window.jQuery, window, document),
function(n) {
    var o = n("<support>").get(0).style,
        r = "Webkit Moz O ms".split(" "),
        t = {
            transition: {
                end: {
                    WebkitTransition: "webkitTransitionEnd",
                    MozTransition: "transitionend",
                    OTransition: "oTransitionEnd",
                    transition: "transitionend"
                }
            },
            animation: {
                end: {
                    WebkitAnimation: "webkitAnimationEnd",
                    MozAnimation: "animationend",
                    OAnimation: "oAnimationEnd",
                    animation: "animationend"
                }
            }
        },
        e = function() {
            return !!a("transform")
        },
        i = function() {
            return !!a("perspective")
        },
        s = function() {
            return !!a("animation")
        };

    function a(t, i) {
        var s = !1,
            e = t.charAt(0).toUpperCase() + t.slice(1);
        return n.each((t + " " + r.join(e + " ") + e).split(" "), function(t, e) {
            if (void 0 !== o[e]) return s = !i || e, !1
        }), s
    }

    function h(t) {
        return a(t, !0)
    }! function() {
        return !!a("transition")
    }() || (n.support.transition = new String(h("transition")), n.support.transition.end = t.transition.end[n.support.transition]), s() && (n.support.animation = new String(h("animation")), n.support.animation.end = t.animation.end[n.support.animation]), e() && (n.support.transform = new String(h("transform")), n.support.transform3d = i())
}(window.Zepto || window.jQuery, (window, document));
(function($) {
    "use strict";
    $.fn.fitVids = function(options) {
        var settings = {
            customSelector: null,
            ignore: null
        };
        if (!document.getElementById("fit-vids-style")) {
            var head = document.head || document.getElementsByTagName("head")[0];
            var css = ".fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}";
            var div = document.createElement("div");
            div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + "</style>";
            head.appendChild(div.childNodes[1])
        }
        if (options) {
            $.extend(settings, options)
        }
        return this.each(function() {
            var selectors = ['iframe[src*="player.vimeo.com"]', 'iframe[src*="youtube.com"]', 'iframe[src*="youtube-nocookie.com"]', 'iframe[src*="kickstarter.com"][src*="video.html"]', "object", "embed"];
            if (settings.customSelector) {
                selectors.push(settings.customSelector)
            }
            var ignoreList = ".fitvidsignore";
            if (settings.ignore) {
                ignoreList = ignoreList + ", " + settings.ignore
            }
            var $allVideos = $(this).find(selectors.join(","));
            $allVideos = $allVideos.not("object object");
            $allVideos = $allVideos.not(ignoreList);
            $allVideos.each(function(count) {
                var $this = $(this);
                if ($this.parents(ignoreList).length > 0) {
                    return
                }
                if (this.tagName.toLowerCase() === "embed" && $this.parent("object").length || $this.parent(".fluid-width-video-wrapper").length) {
                    return
                }
                if (!$this.css("height") && !$this.css("width") && (isNaN($this.attr("height")) || isNaN($this.attr("width")))) {
                    $this.attr("height", 9);
                    $this.attr("width", 16)
                }
                var height = this.tagName.toLowerCase() === "object" || $this.attr("height") && !isNaN(parseInt($this.attr("height"), 10)) ? parseInt($this.attr("height"), 10) : $this.height(),
                    width = !isNaN(parseInt($this.attr("width"), 10)) ? parseInt($this.attr("width"), 10) : $this.width(),
                    aspectRatio = height / width;
                if (!$this.attr("id")) {
                    var videoID = "fitvid" + count;
                    $this.attr("id", videoID)
                }
                $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent(".fluid-width-video-wrapper").css("padding-top", aspectRatio * 100 + "%");
                $this.removeAttr("height").removeAttr("width")
            })
        })
    }
})(window.jQuery || window.Zepto);
! function(e, o) {
    if ("function" == typeof define && define.amd) define(["exports"], o);
    else if ("undefined" != typeof exports) o(exports);
    else {
        var t = {};
        o(t), e.bodyScrollLock = t
    }
}(this, function(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var t = !1;
    if ("undefined" != typeof window) {
        var e = {
            get passive() {
                t = !0
            }
        };
        window.addEventListener("testPassive", null, e), window.removeEventListener("testPassive", null, e)
    }

    function l(o) {
        return c.some(function(e) {
            return !(!e.options.allowTouchMove || !e.options.allowTouchMove(o))
        })
    }

    function d(e) {
        var o = e || window.event;
        return !!l(o.target) || (1 < o.touches.length || (o.preventDefault && o.preventDefault(), !1))
    }

    function n() {
        void 0 !== v && (document.body.style.paddingRight = v, v = void 0), void 0 !== s && (document.body.style.overflow = s, s = void 0)
    }
    var i = "undefined" != typeof window && window.navigator && window.navigator.platform && (/iP(ad|hone|od)/.test(window.navigator.platform) || "MacIntel" === window.navigator.platform && 1 < window.navigator.maxTouchPoints),
        c = [],
        a = !1,
        u = -1,
        s = void 0,
        v = void 0;
    exports.disableBodyScroll = function(r, e) {
        if (r) {
            if (!c.some(function(e) {
                    return e.targetElement === r
                })) {
                var o = {
                    targetElement: r,
                    options: e || {}
                };
                c = [].concat(function(e) {
                    if (Array.isArray(e)) {
                        for (var o = 0, t = Array(e.length); o < e.length; o++) t[o] = e[o];
                        return t
                    }
                    return Array.from(e)
                }(c), [o]), i ? (r.ontouchstart = function(e) {
                    1 === e.targetTouches.length && (u = e.targetTouches[0].clientY)
                }, r.ontouchmove = function(e) {
                    var o, t, n, i;
                    1 === e.targetTouches.length && (t = r, i = (o = e).targetTouches[0].clientY - u, l(o.target) || (t && 0 === t.scrollTop && 0 < i || (n = t) && n.scrollHeight - n.scrollTop <= n.clientHeight && i < 0 ? d(o) : o.stopPropagation()))
                }, a || (document.addEventListener("touchmove", d, t ? {
                    passive: !1
                } : void 0), a = !0)) : function(e) {
                    if (void 0 === v) {
                        var o = !!e && !0 === e.reserveScrollBarGap,
                            t = window.innerWidth - document.documentElement.clientWidth;
                        o && 0 < t && (v = document.body.style.paddingRight, document.body.style.paddingRight = t + "px")
                    }
                    void 0 === s && (s = document.body.style.overflow, document.body.style.overflow = "hidden")
                }(e)
            }
        } else console.error("disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.")
    }, exports.clearAllBodyScrollLocks = function() {
        i ? (c.forEach(function(e) {
            e.targetElement.ontouchstart = null, e.targetElement.ontouchmove = null
        }), a && (document.removeEventListener("touchmove", d, t ? {
            passive: !1
        } : void 0), a = !1), u = -1) : n(), c = []
    }, exports.enableBodyScroll = function(o) {
        o ? (c = c.filter(function(e) {
            return e.targetElement !== o
        }), i ? (o.ontouchstart = null, o.ontouchmove = null, a && 0 === c.length && (document.removeEventListener("touchmove", d, t ? {
            passive: !1
        } : void 0), a = !1)) : c.length || n()) : console.error("enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices.")
    }
});

var requirejs, require, define;
! function(global, setTimeout) {
    var req, s, head, baseElement, dataMain, src, interactiveScript, currentlyAddingScript, mainScript, subPath, version = "2.3.6",
        commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/gm,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        currDirRegExp = /^\.\//,
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        isBrowser = !("undefined" == typeof window || "undefined" == typeof navigator || !window.document),
        isWebWorker = !isBrowser && "undefined" != typeof importScripts,
        readyRegExp = isBrowser && "PLAYSTATION 3" === navigator.platform ? /^complete$/ : /^(complete|loaded)$/,
        defContextName = "_",
        isOpera = "undefined" != typeof opera && "[object Opera]" === opera.toString(),
        contexts = {},
        cfg = {},
        globalDefQueue = [],
        useInteractive = !1;

    function commentReplace(e, t) {
        return t || ""
    }

    function isFunction(e) {
        return "[object Function]" === ostring.call(e)
    }

    function isArray(e) {
        return "[object Array]" === ostring.call(e)
    }

    function each(e, t) {
        var i;
        if (e)
            for (i = 0; i < e.length && (!e[i] || !t(e[i], i, e)); i += 1);
    }

    function eachReverse(e, t) {
        var i;
        if (e)
            for (i = e.length - 1; - 1 < i && (!e[i] || !t(e[i], i, e)); i -= 1);
    }

    function hasProp(e, t) {
        return hasOwn.call(e, t)
    }

    function getOwn(e, t) {
        return hasProp(e, t) && e[t]
    }

    function eachProp(e, t) {
        var i;
        for (i in e)
            if (hasProp(e, i) && t(e[i], i)) break
    }

    function mixin(i, e, r, n) {
        return e && eachProp(e, function(e, t) {
            !r && hasProp(i, t) || (!n || "object" != typeof e || !e || isArray(e) || isFunction(e) || e instanceof RegExp ? i[t] = e : (i[t] || (i[t] = {}), mixin(i[t], e, r, n)))
        }), i
    }

    function bind(e, t) {
        return function() {
            return t.apply(e, arguments)
        }
    }

    function scripts() {
        return document.getElementsByTagName("script")
    }

    function defaultOnError(e) {
        throw e
    }

    function getGlobal(e) {
        if (!e) return e;
        var t = global;
        return each(e.split("."), function(e) {
            t = t[e]
        }), t
    }

    function makeError(e, t, i, r) {
        var n = new Error(t + "\nhttps://requirejs.org/docs/errors.html#" + e);
        return n.requireType = e, n.requireModules = r, i && (n.originalError = i), n
    }
    if (void 0 === define) {
        if (void 0 !== requirejs) {
            if (isFunction(requirejs)) return;
            cfg = requirejs, requirejs = void 0
        }
        void 0 === require || isFunction(require) || (cfg = require, require = void 0), req = requirejs = function(e, t, i, r) {
            var n, o, a = defContextName;
            return isArray(e) || "string" == typeof e || (o = e, isArray(t) ? (e = t, t = i, i = r) : e = []), o && o.context && (a = o.context), (n = getOwn(contexts, a)) || (n = contexts[a] = req.s.newContext(a)), o && n.configure(o), n.require(e, t, i)
        }, req.config = function(e) {
            return req(e)
        }, req.nextTick = void 0 !== setTimeout ? function(e) {
            setTimeout(e, 4)
        } : function(e) {
            e()
        }, require || (require = req), req.version = version, req.jsExtRegExp = /^\/|:|\?|\.js$/, req.isBrowser = isBrowser, s = req.s = {
            contexts: contexts,
            newContext: newContext
        }, req({}), each(["toUrl", "undef", "defined", "specified"], function(t) {
            req[t] = function() {
                var e = contexts[defContextName];
                return e.require[t].apply(e, arguments)
            }
        }), isBrowser && (head = s.head = document.getElementsByTagName("head")[0], baseElement = document.getElementsByTagName("base")[0], baseElement && (head = s.head = baseElement.parentNode)), req.onError = defaultOnError, req.createNode = function(e, t, i) {
            var r = e.xhtml ? document.createElementNS("http://www.w3.org/1999/xhtml", "html:script") : document.createElement("script");
            return r.type = e.scriptType || "text/javascript", r.charset = "utf-8", r.async = !0, r
        }, req.load = function(t, i, r) {
            var e, n = t && t.config || {};
            if (isBrowser) return (e = req.createNode(n, i, r)).setAttribute("data-requirecontext", t.contextName), e.setAttribute("data-requiremodule", i), !e.attachEvent || e.attachEvent.toString && e.attachEvent.toString().indexOf("[native code") < 0 || isOpera ? (e.addEventListener("load", t.onScriptLoad, !1), e.addEventListener("error", t.onScriptError, !1)) : (useInteractive = !0, e.attachEvent("onreadystatechange", t.onScriptLoad)), e.src = r, n.onNodeCreated && n.onNodeCreated(e, n, i, r), currentlyAddingScript = e, baseElement ? head.insertBefore(e, baseElement) : head.appendChild(e), currentlyAddingScript = null, e;
            if (isWebWorker) try {
                setTimeout(function() {}, 0), importScripts(r), t.completeLoad(i)
            } catch (e) {
                t.onError(makeError("importscripts", "importScripts failed for " + i + " at " + r, e, [i]))
            }
        }, isBrowser && !cfg.skipDataMain && eachReverse(scripts(), function(e) {
            if (head || (head = e.parentNode), dataMain = e.getAttribute("data-main")) return mainScript = dataMain, cfg.baseUrl || -1 !== mainScript.indexOf("!") || (mainScript = (src = mainScript.split("/")).pop(), subPath = src.length ? src.join("/") + "/" : "./", cfg.baseUrl = subPath), mainScript = mainScript.replace(jsSuffixRegExp, ""), req.jsExtRegExp.test(mainScript) && (mainScript = dataMain), cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript], !0
        }), define = function(e, i, t) {
            var r, n;
            "string" != typeof e && (t = i, i = e, e = null), isArray(i) || (t = i, i = null), !i && isFunction(t) && (i = [], t.length && (t.toString().replace(commentRegExp, commentReplace).replace(cjsRequireRegExp, function(e, t) {
                i.push(t)
            }), i = (1 === t.length ? ["require"] : ["require", "exports", "module"]).concat(i))), useInteractive && (r = currentlyAddingScript || getInteractiveScript()) && (e || (e = r.getAttribute("data-requiremodule")), n = contexts[r.getAttribute("data-requirecontext")]), n ? (n.defQueue.push([e, i, t]), n.defQueueMap[e] = !0) : globalDefQueue.push([e, i, t])
        }, define.amd = {
            jQuery: !0
        }, req.exec = function(text) {
            return eval(text)
        }, req(cfg)
    }

    function newContext(u) {
        var i, e, l, c, d, g = {
                waitSeconds: 7,
                baseUrl: "./",
                paths: {},
                bundles: {},
                pkgs: {},
                shim: {},
                config: {}
            },
            p = {},
            f = {},
            r = {},
            h = [],
            m = {},
            n = {},
            v = {},
            x = 1,
            b = 1;

        function q(e, t, i) {
            var r, n, o, a, s, u, c, d, p, f, l = t && t.split("/"),
                h = g.map,
                m = h && h["*"];
            if (e && (u = (e = e.split("/")).length - 1, g.nodeIdCompat && jsSuffixRegExp.test(e[u]) && (e[u] = e[u].replace(jsSuffixRegExp, "")), "." === e[0].charAt(0) && l && (e = l.slice(0, l.length - 1).concat(e)), function(e) {
                    var t, i;
                    for (t = 0; t < e.length; t++)
                        if ("." === (i = e[t])) e.splice(t, 1), t -= 1;
                        else if (".." === i) {
                        if (0 === t || 1 === t && ".." === e[2] || ".." === e[t - 1]) continue;
                        0 < t && (e.splice(t - 1, 2), t -= 2)
                    }
                }(e), e = e.join("/")), i && h && (l || m)) {
                e: for (o = (n = e.split("/")).length; 0 < o; o -= 1) {
                    if (s = n.slice(0, o).join("/"), l)
                        for (a = l.length; 0 < a; a -= 1)
                            if ((r = getOwn(h, l.slice(0, a).join("/"))) && (r = getOwn(r, s))) {
                                c = r, d = o;
                                break e
                            }! p && m && getOwn(m, s) && (p = getOwn(m, s), f = o)
                }!c && p && (c = p, d = f),
                c && (n.splice(0, d, c), e = n.join("/"))
            }
            return getOwn(g.pkgs, e) || e
        }

        function E(t) {
            isBrowser && each(scripts(), function(e) {
                if (e.getAttribute("data-requiremodule") === t && e.getAttribute("data-requirecontext") === l.contextName) return e.parentNode.removeChild(e), !0
            })
        }

        function w(e) {
            var t = getOwn(g.paths, e);
            if (t && isArray(t) && 1 < t.length) return t.shift(), l.require.undef(e), l.makeRequire(null, {
                skipMap: !0
            })([e]), !0
        }

        function y(e) {
            var t, i = e ? e.indexOf("!") : -1;
            return -1 < i && (t = e.substring(0, i), e = e.substring(i + 1, e.length)), [t, e]
        }

        function S(e, t, i, r) {
            var n, o, a, s, u = null,
                c = t ? t.name : null,
                d = e,
                p = !0,
                f = "";
            return e || (p = !1, e = "_@r" + (x += 1)), u = (s = y(e))[0], e = s[1], u && (u = q(u, c, r), o = getOwn(m, u)), e && (u ? f = i ? e : o && o.normalize ? o.normalize(e, function(e) {
                return q(e, c, r)
            }) : -1 === e.indexOf("!") ? q(e, c, r) : e : (u = (s = y(f = q(e, c, r)))[0], f = s[1], i = !0, n = l.nameToUrl(f))), {
                prefix: u,
                name: f,
                parentMap: t,
                unnormalized: !!(a = !u || o || i ? "" : "_unnormalized" + (b += 1)),
                url: n,
                originalName: d,
                isDefine: p,
                id: (u ? u + "!" + f : f) + a
            }
        }

        function k(e) {
            var t = e.id,
                i = getOwn(p, t);
            return i || (i = p[t] = new l.Module(e)), i
        }

        function M(e, t, i) {
            var r = e.id,
                n = getOwn(p, r);
            !hasProp(m, r) || n && !n.defineEmitComplete ? (n = k(e)).error && "error" === t ? i(n.error) : n.on(t, i) : "defined" === t && i(m[r])
        }

        function O(i, e) {
            var t = i.requireModules,
                r = !1;
            e ? e(i) : (each(t, function(e) {
                var t = getOwn(p, e);
                t && (t.error = i, t.events.error && (r = !0, t.emit("error", i)))
            }), r || req.onError(i))
        }

        function j() {
            globalDefQueue.length && (each(globalDefQueue, function(e) {
                var t = e[0];
                "string" == typeof t && (l.defQueueMap[t] = !0), h.push(e)
            }), globalDefQueue = [])
        }

        function P(e) {
            delete p[e], delete f[e]
        }

        function R() {
            var e, r, t = 1e3 * g.waitSeconds,
                n = t && l.startTime + t < (new Date).getTime(),
                o = [],
                a = [],
                s = !1,
                u = !0;
            if (!i) {
                if (i = !0, eachProp(f, function(e) {
                        var t = e.map,
                            i = t.id;
                        if (e.enabled && (t.isDefine || a.push(e), !e.error))
                            if (!e.inited && n) w(i) ? s = r = !0 : (o.push(i), E(i));
                            else if (!e.inited && e.fetched && t.isDefine && (s = !0, !t.prefix)) return u = !1
                    }), n && o.length) return (e = makeError("timeout", "Load timeout for modules: " + o, null, o)).contextName = l.contextName, O(e);
                u && each(a, function(e) {
                    ! function n(o, a, s) {
                        var e = o.map.id;
                        o.error ? o.emit("error", o.error) : (a[e] = !0, each(o.depMaps, function(e, t) {
                            var i = e.id,
                                r = getOwn(p, i);
                            !r || o.depMatched[t] || s[i] || (getOwn(a, i) ? (o.defineDep(t, m[i]), o.check()) : n(r, a, s))
                        }), s[e] = !0)
                    }(e, {}, {})
                }), n && !r || !s || !isBrowser && !isWebWorker || d || (d = setTimeout(function() {
                    d = 0, R()
                }, 50)), i = !1
            }
        }

        function a(e) {
            hasProp(m, e[0]) || k(S(e[0], null, !0)).init(e[1], e[2])
        }

        function o(e, t, i, r) {
            e.detachEvent && !isOpera ? r && e.detachEvent(r, t) : e.removeEventListener(i, t, !1)
        }

        function s(e) {
            var t = e.currentTarget || e.srcElement;
            return o(t, l.onScriptLoad, "load", "onreadystatechange"), o(t, l.onScriptError, "error"), {
                node: t,
                id: t && t.getAttribute("data-requiremodule")
            }
        }

        function T() {
            var e;
            for (j(); h.length;) {
                if (null === (e = h.shift())[0]) return O(makeError("mismatch", "Mismatched anonymous define() module: " + e[e.length - 1]));
                a(e)
            }
            l.defQueueMap = {}
        }
        return c = {
            require: function(e) {
                return e.require ? e.require : e.require = l.makeRequire(e.map)
            },
            exports: function(e) {
                if (e.usingExports = !0, e.map.isDefine) return e.exports ? m[e.map.id] = e.exports : e.exports = m[e.map.id] = {}
            },
            module: function(e) {
                return e.module ? e.module : e.module = {
                    id: e.map.id,
                    uri: e.map.url,
                    config: function() {
                        return getOwn(g.config, e.map.id) || {}
                    },
                    exports: e.exports || (e.exports = {})
                }
            }
        }, (e = function(e) {
            this.events = getOwn(r, e.id) || {}, this.map = e, this.shim = getOwn(g.shim, e.id), this.depExports = [], this.depMaps = [], this.depMatched = [], this.pluginMaps = {}, this.depCount = 0
        }).prototype = {
            init: function(e, t, i, r) {
                r = r || {}, this.inited || (this.factory = t, i ? this.on("error", i) : this.events.error && (i = bind(this, function(e) {
                    this.emit("error", e)
                })), this.depMaps = e && e.slice(0), this.errback = i, this.inited = !0, this.ignore = r.ignore, r.enabled || this.enabled ? this.enable() : this.check())
            },
            defineDep: function(e, t) {
                this.depMatched[e] || (this.depMatched[e] = !0, this.depCount -= 1, this.depExports[e] = t)
            },
            fetch: function() {
                if (!this.fetched) {
                    this.fetched = !0, l.startTime = (new Date).getTime();
                    var e = this.map;
                    if (!this.shim) return e.prefix ? this.callPlugin() : this.load();
                    l.makeRequire(this.map, {
                        enableBuildCallback: !0
                    })(this.shim.deps || [], bind(this, function() {
                        return e.prefix ? this.callPlugin() : this.load()
                    }))
                }
            },
            load: function() {
                var e = this.map.url;
                n[e] || (n[e] = !0, l.load(this.map.id, e))
            },
            check: function() {
                if (this.enabled && !this.enabling) {
                    var t, e, i = this.map.id,
                        r = this.depExports,
                        n = this.exports,
                        o = this.factory;
                    if (this.inited) {
                        if (this.error) this.emit("error", this.error);
                        else if (!this.defining) {
                            if (this.defining = !0, this.depCount < 1 && !this.defined) {
                                if (isFunction(o)) {
                                    if (this.events.error && this.map.isDefine || req.onError !== defaultOnError) try {
                                        n = l.execCb(i, o, r, n)
                                    } catch (e) {
                                        t = e
                                    } else n = l.execCb(i, o, r, n);
                                    if (this.map.isDefine && void 0 === n && ((e = this.module) ? n = e.exports : this.usingExports && (n = this.exports)), t) return t.requireMap = this.map, t.requireModules = this.map.isDefine ? [this.map.id] : null, t.requireType = this.map.isDefine ? "define" : "require", O(this.error = t)
                                } else n = o;
                                if (this.exports = n, this.map.isDefine && !this.ignore && (m[i] = n, req.onResourceLoad)) {
                                    var a = [];
                                    each(this.depMaps, function(e) {
                                        a.push(e.normalizedMap || e)
                                    }), req.onResourceLoad(l, this.map, a)
                                }
                                P(i), this.defined = !0
                            }
                            this.defining = !1, this.defined && !this.defineEmitted && (this.defineEmitted = !0, this.emit("defined", this.exports), this.defineEmitComplete = !0)
                        }
                    } else hasProp(l.defQueueMap, i) || this.fetch()
                }
            },
            callPlugin: function() {
                var u = this.map,
                    c = u.id,
                    e = S(u.prefix);
                this.depMaps.push(e), M(e, "defined", bind(this, function(e) {
                    var o, t, i, r = getOwn(v, this.map.id),
                        n = this.map.name,
                        a = this.map.parentMap ? this.map.parentMap.name : null,
                        s = l.makeRequire(u.parentMap, {
                            enableBuildCallback: !0
                        });
                    return this.map.unnormalized ? (e.normalize && (n = e.normalize(n, function(e) {
                        return q(e, a, !0)
                    }) || ""), M(t = S(u.prefix + "!" + n, this.map.parentMap, !0), "defined", bind(this, function(e) {
                        this.map.normalizedMap = t, this.init([], function() {
                            return e
                        }, null, {
                            enabled: !0,
                            ignore: !0
                        })
                    })), void((i = getOwn(p, t.id)) && (this.depMaps.push(t), this.events.error && i.on("error", bind(this, function(e) {
                        this.emit("error", e)
                    })), i.enable()))) : r ? (this.map.url = l.nameToUrl(r), void this.load()) : ((o = bind(this, function(e) {
                        this.init([], function() {
                            return e
                        }, null, {
                            enabled: !0
                        })
                    })).error = bind(this, function(e) {
                        this.inited = !0, (this.error = e).requireModules = [c], eachProp(p, function(e) {
                            0 === e.map.id.indexOf(c + "_unnormalized") && P(e.map.id)
                        }), O(e)
                    }), o.fromText = bind(this, function(e, t) {
                        var i = u.name,
                            r = S(i),
                            n = useInteractive;
                        t && (e = t), n && (useInteractive = !1), k(r), hasProp(g.config, c) && (g.config[i] = g.config[c]);
                        try {
                            req.exec(e)
                        } catch (e) {
                            return O(makeError("fromtexteval", "fromText eval for " + c + " failed: " + e, e, [c]))
                        }
                        n && (useInteractive = !0), this.depMaps.push(r), l.completeLoad(i), s([i], o)
                    }), void e.load(u.name, s, o, g))
                })), l.enable(e, this), this.pluginMaps[e.id] = e
            },
            enable: function() {
                (f[this.map.id] = this).enabled = !0, this.enabling = !0, each(this.depMaps, bind(this, function(e, t) {
                    var i, r, n;
                    if ("string" == typeof e) {
                        if (e = S(e, this.map.isDefine ? this.map : this.map.parentMap, !1, !this.skipMap), this.depMaps[t] = e, n = getOwn(c, e.id)) return void(this.depExports[t] = n(this));
                        this.depCount += 1, M(e, "defined", bind(this, function(e) {
                            this.undefed || (this.defineDep(t, e), this.check())
                        })), this.errback ? M(e, "error", bind(this, this.errback)) : this.events.error && M(e, "error", bind(this, function(e) {
                            this.emit("error", e)
                        }))
                    }
                    i = e.id, r = p[i], hasProp(c, i) || !r || r.enabled || l.enable(e, this)
                })), eachProp(this.pluginMaps, bind(this, function(e) {
                    var t = getOwn(p, e.id);
                    t && !t.enabled && l.enable(e, this)
                })), this.enabling = !1, this.check()
            },
            on: function(e, t) {
                var i = this.events[e];
                i || (i = this.events[e] = []), i.push(t)
            },
            emit: function(e, t) {
                each(this.events[e], function(e) {
                    e(t)
                }), "error" === e && delete this.events[e]
            }
        }, (l = {
            config: g,
            contextName: u,
            registry: p,
            defined: m,
            urlFetched: n,
            defQueue: h,
            defQueueMap: {},
            Module: e,
            makeModuleMap: S,
            nextTick: req.nextTick,
            onError: O,
            configure: function(e) {
                if (e.baseUrl && "/" !== e.baseUrl.charAt(e.baseUrl.length - 1) && (e.baseUrl += "/"), "string" == typeof e.urlArgs) {
                    var i = e.urlArgs;
                    e.urlArgs = function(e, t) {
                        return (-1 === t.indexOf("?") ? "?" : "&") + i
                    }
                }
                var r = g.shim,
                    n = {
                        paths: !0,
                        bundles: !0,
                        config: !0,
                        map: !0
                    };
                eachProp(e, function(e, t) {
                    n[t] ? (g[t] || (g[t] = {}), mixin(g[t], e, !0, !0)) : g[t] = e
                }), e.bundles && eachProp(e.bundles, function(e, t) {
                    each(e, function(e) {
                        e !== t && (v[e] = t)
                    })
                }), e.shim && (eachProp(e.shim, function(e, t) {
                    isArray(e) && (e = {
                        deps: e
                    }), !e.exports && !e.init || e.exportsFn || (e.exportsFn = l.makeShimExports(e)), r[t] = e
                }), g.shim = r), e.packages && each(e.packages, function(e) {
                    var t;
                    t = (e = "string" == typeof e ? {
                        name: e
                    } : e).name, e.location && (g.paths[t] = e.location), g.pkgs[t] = e.name + "/" + (e.main || "main").replace(currDirRegExp, "").replace(jsSuffixRegExp, "")
                }), eachProp(p, function(e, t) {
                    e.inited || e.map.unnormalized || (e.map = S(t, null, !0))
                }), (e.deps || e.callback) && l.require(e.deps || [], e.callback)
            },
            makeShimExports: function(t) {
                return function() {
                    var e;
                    return t.init && (e = t.init.apply(global, arguments)), e || t.exports && getGlobal(t.exports)
                }
            },
            makeRequire: function(o, a) {
                function s(e, t, i) {
                    var r, n;
                    return a.enableBuildCallback && t && isFunction(t) && (t.__requireJsBuild = !0), "string" == typeof e ? isFunction(t) ? O(makeError("requireargs", "Invalid require call"), i) : o && hasProp(c, e) ? c[e](p[o.id]) : req.get ? req.get(l, e, o, s) : (r = S(e, o, !1, !0).id, hasProp(m, r) ? m[r] : O(makeError("notloaded", 'Module name "' + r + '" has not been loaded yet for context: ' + u + (o ? "" : ". Use require([])")))) : (T(), l.nextTick(function() {
                        T(), (n = k(S(null, o))).skipMap = a.skipMap, n.init(e, t, i, {
                            enabled: !0
                        }), R()
                    }), s)
                }
                return a = a || {}, mixin(s, {
                    isBrowser: isBrowser,
                    toUrl: function(e) {
                        var t, i = e.lastIndexOf("."),
                            r = e.split("/")[0];
                        return -1 !== i && (!("." === r || ".." === r) || 1 < i) && (t = e.substring(i, e.length), e = e.substring(0, i)), l.nameToUrl(q(e, o && o.id, !0), t, !0)
                    },
                    defined: function(e) {
                        return hasProp(m, S(e, o, !1, !0).id)
                    },
                    specified: function(e) {
                        return e = S(e, o, !1, !0).id, hasProp(m, e) || hasProp(p, e)
                    }
                }), o || (s.undef = function(i) {
                    j();
                    var e = S(i, o, !0),
                        t = getOwn(p, i);
                    t.undefed = !0, E(i), delete m[i], delete n[e.url], delete r[i], eachReverse(h, function(e, t) {
                        e[0] === i && h.splice(t, 1)
                    }), delete l.defQueueMap[i], t && (t.events.defined && (r[i] = t.events), P(i))
                }), s
            },
            enable: function(e) {
                getOwn(p, e.id) && k(e).enable()
            },
            completeLoad: function(e) {
                var t, i, r, n = getOwn(g.shim, e) || {},
                    o = n.exports;
                for (j(); h.length;) {
                    if (null === (i = h.shift())[0]) {
                        if (i[0] = e, t) break;
                        t = !0
                    } else i[0] === e && (t = !0);
                    a(i)
                }
                if (l.defQueueMap = {}, r = getOwn(p, e), !t && !hasProp(m, e) && r && !r.inited) {
                    if (!(!g.enforceDefine || o && getGlobal(o))) return w(e) ? void 0 : O(makeError("nodefine", "No define call for " + e, null, [e]));
                    a([e, n.deps || [], n.exportsFn])
                }
                R()
            },
            nameToUrl: function(e, t, i) {
                var r, n, o, a, s, u, c = getOwn(g.pkgs, e);
                if (c && (e = c), u = getOwn(v, e)) return l.nameToUrl(u, t, i);
                if (req.jsExtRegExp.test(e)) a = e + (t || "");
                else {
                    for (r = g.paths, o = (n = e.split("/")).length; 0 < o; o -= 1)
                        if (s = getOwn(r, n.slice(0, o).join("/"))) {
                            isArray(s) && (s = s[0]), n.splice(0, o, s);
                            break
                        } a = n.join("/"), a = ("/" === (a += t || (/^data\:|^blob\:|\?/.test(a) || i ? "" : ".js")).charAt(0) || a.match(/^[\w\+\.\-]+:/) ? "" : g.baseUrl) + a
                }
                return g.urlArgs && !/^blob\:/.test(a) ? a + g.urlArgs(e, a) : a
            },
            load: function(e, t) {
                req.load(l, e, t)
            },
            execCb: function(e, t, i, r) {
                return t.apply(r, i)
            },
            onScriptLoad: function(e) {
                if ("load" === e.type || readyRegExp.test((e.currentTarget || e.srcElement).readyState)) {
                    interactiveScript = null;
                    var t = s(e);
                    l.completeLoad(t.id)
                }
            },
            onScriptError: function(e) {
                var i = s(e);
                if (!w(i.id)) {
                    var r = [];
                    return eachProp(p, function(e, t) {
                        0 !== t.indexOf("_@r") && each(e.depMaps, function(e) {
                            if (e.id === i.id) return r.push(t), !0
                        })
                    }), O(makeError("scripterror", 'Script error for "' + i.id + (r.length ? '", needed by: ' + r.join(", ") : '"'), e, [i.id]))
                }
            }
        }).require = l.makeRequire(), l
    }

    function getInteractiveScript() {
        return interactiveScript && "interactive" === interactiveScript.readyState || eachReverse(scripts(), function(e) {
            if ("interactive" === e.readyState) return interactiveScript = e
        }), interactiveScript
    }
}(this, "undefined" == typeof setTimeout ? void 0 : setTimeout);
(function($) {
    'use strict';
    window.IP_Wishlist = {
        init_product_button: function() {
            if ($.fn.cookie || typeof(Cookies) !== 'undefined') {
                var wishlistCookie = $.fn.cookie ? $.cookie(ideapark_wp_vars.wishlistCookieName) : Cookies.get(ideapark_wp_vars.wishlistCookieName);
                if (wishlistCookie) {
                    wishlistCookie = JSON.parse(wishlistCookie);
                    for (var id in wishlistCookie) {
                        if (wishlistCookie.hasOwnProperty(id)) {
                            $('.c-wishlist__item-' + wishlistCookie[id] + '-btn').addClass('c-wishlist__btn--added');
                        }
                    }
                }
            }
        },
        init: function() {
            var wishlistAjax = false;
            this.init_product_button();
            $(document).on('click', '.js-wishlist-btn', function(e) {
                e.preventDefault();
                if (wishlistAjax) {
                    return;
                }
                var productId = $(this).data('product-id'),
                    $buttons = $('.c-wishlist__item-' + productId + '-btn');
                $buttons.removeClass('c-wishlist__btn--added');
                $buttons.ideapark_button('loading', 16, true);
                wishlistAjax = $.ajax({
                    type: 'POST',
                    url: ideapark_wp_vars.ajaxUrl,
                    data: {
                        action: 'ideapark_wishlist_toggle',
                        product_id: productId
                    },
                    dataType: 'json',
                    cache: false,
                    headers: {
                        'cache-control': 'no-cache'
                    },
                    complete: function() {
                        wishlistAjax = false;
                    },
                    success: function(json) {
                        $(document.body).trigger('wc_fragment_refresh');
                        $buttons.ideapark_button('reset');
                        if (json.status === '1') {
                            $('body').trigger('wishlist_added_item');
                            $buttons.attr('title', ideapark_wp_vars.wishlistTitleRemove);
                            $buttons.addClass('c-wishlist__btn--added');
                        } else {
                            $('body').trigger('wishlist_removed_item');
                            $buttons.attr('title', ideapark_wp_vars.wishlistTitleAdd);
                        }
                    }
                });
            });
            var $wishlistTable = $('.js-wishlist-table');
            if ($wishlistTable.length) {
                var _wishlistRemoveItem = function($this) {
                    var $thisTr = $this.closest('tr'),
                        productId = $thisTr.data('product-id');
                    $thisTr.addClass('loading');
                    $.ajax({
                        type: 'POST',
                        url: ideapark_wp_vars.ajaxUrl,
                        data: {
                            action: 'ideapark_wishlist_toggle',
                            product_id: productId
                        },
                        dataType: 'json',
                        cache: false,
                        headers: {
                            'cache-control': 'no-cache'
                        },
                        success: function(json) {
                            $(document.body).trigger('wc_fragment_refresh');
                            var $share_link = $('#ip-wishlist-share-link');
                            $('body').trigger('wishlist_removed_item');
                            if ($share_link.length === 1 && typeof json.share_link !== 'undefined') {
                                $share_link.val(json.share_link);
                            }
                            if (json.count > 0) {} else {
                                $('.js-wishlist').css('display', 'none');
                                $('.js-wishlist-empty').removeClass('h-hidden');
                            }
                            $thisTr.fadeOut(150, function() {
                                $(this).remove();
                            });
                        }
                    }).fail(function() {
                        $thisTr.removeClass('loading');
                    });
                };
                $wishlistTable.on('click', '.js-wishlist-remove', function(e) {
                    e.preventDefault();
                    var $this = $(this);
                    if ($this.hasClass('clicked')) {
                        return;
                    }
                    $this.addClass('clicked');
                    _wishlistRemoveItem($this);
                });
            }
        }
    };
    $(document).ready(function() {
        IP_Wishlist.init();
    });
})(jQuery);
(function($, root, undefined) {
    "use strict";
    try {
        document.createEvent("TouchEvent");
        root.ideapark_is_mobile = true;
    } catch (e) {
        root.ideapark_is_mobile = false;
    }
    root.ideapark_is_responsinator = false;
    if (document.referrer) {
        root.ideapark_is_responsinator = (document.referrer.split('/')[2] == 'www.responsinator.com');
    }
    var ideapark_scroll_busy = true;
    var ideapark_resize_busy = true;
    var ideapark_defer_action_enabled = true;
    var ideapark_defer_action_list = [];
    var ideapark_scroll_action_list = [];
    var ideapark_resize_action_list = [];
    var ideapark_resize_action_list_500 = [];
    var ideapark_resize_action_list_layout = [];
    var ideapark_on_transition_end = 'transitionend webkitTransitionEnd oTransitionEnd';
    var ideapark_on_animation_end = 'animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd';
    root.ideapark_window_width = window.innerWidth;
    root.ideapark_is_mobile_layout = window.innerWidth < 1190;
    root.$ideapark_admin_bar = null;
    root.ideapark_adminbar_height = 0;
    root.ideapark_adminbar_visible_height = 0;
    root.ideapark_adminbar_position = 0;
    root.ideapark_debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };
    root.ideapark_isset = function(obj) {
        return typeof(obj) != 'undefined';
    };
    root.ideapark_empty = function(obj) {
        return typeof(obj) == 'undefined' || (typeof(obj) == 'object' && obj == null) || (typeof(obj) == 'string' && ideapark_alltrim(obj) == '') || obj === 0;
    };
    root.ideapark_is_function = function(obj) {
        return typeof(obj) == 'function';
    };
    root.ideapark_is_object = function(obj) {
        return typeof(obj) == 'object';
    };
    root.ideapark_alltrim = function(str) {
        var dir = arguments[1] !== undefined ? arguments[1] : 'a';
        var rez = '';
        var i, start = 0,
            end = str.length - 1;
        if (dir == 'a' || dir == 'l') {
            for (i = 0; i < str.length; i++) {
                if (str.substr(i, 1) != ' ') {
                    start = i;
                    break;
                }
            }
        }
        if (dir == 'a' || dir == 'r') {
            for (i = str.length - 1; i >= 0; i--) {
                if (str.substr(i, 1) != ' ') {
                    end = i;
                    break;
                }
            }
        }
        return str.substring(start, end + 1);
    };
    root.ideapark_ltrim = function(str) {
        return ideapark_alltrim(str, 'l');
    };
    root.ideapark_rtrim = function(str) {
        return ideapark_alltrim(str, 'r');
    };
    root.ideapark_dec2hex = function(n) {
        return Number(n).toString(16);
    };
    root.ideapark_hex2dec = function(hex) {
        return parseInt(hex, 16);
    };
    root.ideapark_in_array = function(val, thearray) {
        var rez = false;
        for (var i = 0; i < thearray.length; i++) {
            if (thearray[i] == val) {
                rez = true;
                break;
            }
        }
        return rez;
    };
    root.ideapark_detectIE = function() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }
        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }
        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }
        return false;
    };
    root.ideapark_loadScript = function(src, cb, async) {
        var script = document.createElement('script');
        script.async = !!(typeof async !=='undefined' && async);
        script.src = src;
        script.onerror = function() {
            if (typeof cb !== 'undefined') {
                cb(new Error("Failed to load" + src));
            }
        };
        script.onload = function() {
            if (typeof cb !== 'undefined') {
                cb();
            }
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    };
    root.ideapark_cookies = {
        get: function(name) {
            var e, b, cookie = document.cookie,
                p = name + '=';
            if (!cookie) {
                return;
            }
            b = cookie.indexOf('; ' + p);
            if (b === -1) {
                b = cookie.indexOf(p);
                if (b !== 0) {
                    return null;
                }
            } else {
                b += 2;
            }
            e = cookie.indexOf(';', b);
            if (e === -1) {
                e = cookie.length;
            }
            return decodeURIComponent(cookie.substring(b + p.length, e));
        },
        set: function(name, value, expires, path, domain, secure) {
            var d = new Date();
            if (typeof(expires) === 'object' && expires.toGMTString) {
                expires = expires.toGMTString();
            } else if (parseInt(expires, 10)) {
                d.setTime(d.getTime() + (parseInt(expires, 10) * 1000));
                expires = d.toGMTString();
            } else {
                expires = '';
            }
            if (typeof path == 'undefined') {
                path = ideapark_wp_vars.cookiePath;
            }
            if (typeof domain == 'undefined') {
                domain = ideapark_wp_vars.cookieDomain;
            }
            document.cookie = name + '=' + encodeURIComponent(value) +
                (expires ? '; expires=' + expires : '') +
                (path ? '; path=' + path : '') +
                (domain ? '; domain=' + domain : '') +
                (secure ? '; secure' : '');
        },
        remove: function(name, path, domain, secure) {
            this.set(name, '', -1000, path, domain, secure);
        }
    };
    root.ideapark_wpadminbar_resize = function() {
        $ideapark_admin_bar = $('#wpadminbar');
        if ($ideapark_admin_bar.length) {
            var window_width = $(window).width();
            if (window_width > 782 && $ideapark_admin_bar.hasClass('mobile')) {
                $ideapark_admin_bar.removeClass('mobile');
            } else if (window_width <= 782 && !$ideapark_admin_bar.hasClass('mobile')) {
                $ideapark_admin_bar.addClass('mobile');
            }
            ideapark_adminbar_height = $ideapark_admin_bar.outerHeight();
            ideapark_adminbar_position = $ideapark_admin_bar.css('position');
            if (ideapark_adminbar_position === 'fixed' || ideapark_adminbar_position === 'absolute') {
                $(".js-fixed").css({
                    top: ideapark_adminbar_visible_height,
                    'max-height': 'calc(100% - ' + ideapark_adminbar_visible_height + 'px)'
                });
            } else {
                $(".js-fixed").css({
                    top: 0,
                    'max-height': '100%'
                });
            }
            ideapark_wpadminbar_scroll();
        }
    };
    root.ideapark_wpadminbar_scroll = function() {
        if ($ideapark_admin_bar === null) {
            $ideapark_admin_bar = $('#wpadminbar');
        }
        if ($ideapark_admin_bar.length) {
            var scroll_top_mobile = window.scrollY;
            var top_new = 0;
            if (ideapark_adminbar_position === 'fixed') {
                top_new = ideapark_adminbar_height;
            } else {
                top_new = ideapark_adminbar_height - scroll_top_mobile;
                if (top_new < 0) {
                    top_new = 0;
                }
            }
            if (ideapark_adminbar_visible_height != top_new) {
                ideapark_adminbar_visible_height = top_new;
                $(document).trigger('ideapark.wpadminbar.scroll', ideapark_adminbar_visible_height);
            }
        }
    };
    root.ideapark_scroll_action_add = function($action) {
        ideapark_scroll_action_list.push($action);
    };
    root.ideapark_resize_action_add = function($action) {
        ideapark_resize_action_list.push($action);
    };
    root.ideapark_resize_action_500_add = function($action) {
        ideapark_resize_action_list_500.push($action);
    };
    root.ideapark_resize_action_layout_add = function($action) {
        ideapark_resize_action_list_layout.push($action);
    };
    root.ideapark_scroll_actions = function() {
        ideapark_wpadminbar_scroll();
        ideapark_scroll_action_list.forEach(function(item) {
            if (ideapark_is_function(item)) {
                item();
            }
        });
        ideapark_scroll_busy = false;
    };
    root.ideapark_resize_actions = function() {
        var ideapark_is_mobile_layout_new = (window.innerWidth < 1190);
        var is_layout_changed = (ideapark_is_mobile_layout !== ideapark_is_mobile_layout_new);
        var is_width_changed = (ideapark_window_width != window.innerWidth);
        ideapark_is_mobile_layout = ideapark_is_mobile_layout_new;
        ideapark_window_width = window.innerWidth;
        ideapark_wpadminbar_resize();
        ideapark_resize_action_list.forEach(function(item) {
            if (ideapark_is_function(item)) {
                item();
            }
        });
        if (is_layout_changed) {
            $(document).addClass('block-transition');
            setTimeout(function() {
                $(document).removeClass('block-transition');
            }, 500);
            ideapark_resize_action_list_layout.forEach(function(item) {
                if (ideapark_is_function(item)) {
                    item();
                }
            });
        }
        if (is_width_changed) {
            ideapark_debounce_500();
            setTimeout(function() {
                ideapark_wpadminbar_resize();
                $(document).trigger('ideapark.wpadminbar.scroll', ideapark_adminbar_visible_height);
            }, 100);
        }
        ideapark_resize_busy = false;
    };
    root.ideapark_on_transition_end_callback = function($element, callback) {
        var callback_inner = function() {
            $element.off(ideapark_on_transition_end, callback_inner);
            callback();
        };
        $element.on(ideapark_on_transition_end, callback_inner);
    };
    root.ideapark_on_animation_end_callback = function($element, callback) {
        var callback_inner = function() {
            $element.off(ideapark_on_animation_end, callback_inner);
            callback();
        };
        $element.on(ideapark_on_animation_end, callback_inner);
    };
    root.ideapark_debounce_500 = ideapark_debounce(function() {
        ideapark_resize_action_list_500.forEach(function(item) {
            if (ideapark_is_function(item)) {
                item();
            }
        });
    }, 500);
    root.ideapark_get_time = function() {
        var now;
        if (typeof performance !== 'undefined' && performance.now) {
            now = (performance.now() + performance.timing.navigationStart) / 1000;
        } else {
            now = (Date.now ? Date.now() : new Date().getTime()) / 1000;
        }
        return now;
    };
    root.ideapark_start_time = ideapark_get_time();
    $(window).on('scroll', function() {
        if (window.requestAnimationFrame) {
            if (!ideapark_scroll_busy) {
                ideapark_scroll_busy = true;
                window.requestAnimationFrame(ideapark_scroll_actions);
            }
        } else {
            ideapark_scroll_actions();
        }
    });
    $(window).on('resize', function() {
        if (window.requestAnimationFrame) {
            if (!ideapark_resize_busy) {
                ideapark_resize_busy = true;
                window.requestAnimationFrame(ideapark_resize_actions);
            }
        } else {
            ideapark_resize_actions();
        }
    });
    root.ideapark_defer_action_add = function($action) {
        if (ideapark_defer_action_enabled) {
            ideapark_defer_action_list.push($action);
        } else if (ideapark_is_function($action)) {
            $action();
        }
    };
    root.ideapark_defer_action_run = function() {
        if (ideapark_defer_action_enabled) {
            ideapark_defer_action_enabled = false;
            ideapark_defer_action_list.forEach(function(item) {
                if (ideapark_is_function(item)) {
                    item();
                }
            });
        }
    };
    class ideapark_defer_loading {
        constructor(e) {
            this.triggerEvents = e;
            this.eventOptions = {
                passive: !0
            };
            this.userEventListener = this.triggerListener.bind(this);
            this.delayedScripts = {
                normal: [],
                async: [],
                defer: []
            };
        }
        _addUserInteractionListener(e) {
            this.triggerEvents.forEach((t => window.addEventListener(t, e.userEventListener, e.eventOptions)));
        }
        _removeUserInteractionListener(e) {
            this.triggerEvents.forEach((t => window.removeEventListener(t, e.userEventListener, e.eventOptions)));
        }
        triggerListener(e) {
            this._removeUserInteractionListener(this);
            if (e.type === 'touchstart') {
                setTimeout(this._loadEverythingNow, 500);
            } else {
                this._loadEverythingNow();
            }
        }
        async _loadEverythingNow() {
            ideapark_defer_action_run();
        }
        static run() {
            if (window.scrollY > 10) {
                ideapark_defer_action_enabled = false;
            } else {
                const e = new ideapark_defer_loading(["keydown", "mousemove", "touchmove", "touchstart", "touchend", "wheel", "scroll"]);
                e._addUserInteractionListener(e);
            }
            window.addEventListener("touchstart", function(e) {}, false);
            window.addEventListener("touchend", function(e) {}, false);
            window.addEventListener("click", function(e) {}, false);
        }
    }
    ideapark_defer_loading.run();
})(jQuery, window);
class IdeaparkQueue {
    static init() {
        this.queue = [];
        this.pendingPromise = false;
        this.stop = false;
    }
    static enqueue(promise) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                promise,
                resolve,
                reject,
            });
            this.dequeue();
        });
    }
    static dequeue() {
        if (this.workingOnPromise) {
            return false;
        }
        if (this.stop) {
            this.queue = [];
            this.stop = false;
            return;
        }
        const item = this.queue.shift();
        if (!item) {
            return false;
        }
        try {
            this.workingOnPromise = true;
            item.promise().then((value) => {
                this.workingOnPromise = false;
                item.resolve(value);
                this.dequeue();
            }).catch(err => {
                this.workingOnPromise = false;
                item.reject(err);
                this.dequeue();
            });
        } catch (err) {
            this.workingOnPromise = false;
            item.reject(err);
            this.dequeue();
        }
        return true;
    }
}
IdeaparkQueue.init();
(function($, root, undefined) {
    "use strict";
    $.migrateMute = true;
    $.migrateTrace = false;
    if (!ideapark_empty(requirejs)) {
        requirejs.config({
            baseUrl: ideapark_wp_vars.themeUri + '/assets/js',
            paths: {
                text: 'requirejs/text',
                css: 'requirejs/css',
                json: 'requirejs/json'
            },
            urlArgs: function(id, url) {
                var args = '';
                if (url.indexOf('/css/photoswipe/') !== -1) {
                    args = 'v=' + ideapark_wp_vars.stylesHash;
                }
                if (id === 'photoswipe/photoswipe.min' || id === 'photoswipe/photoswipe-ui-default.min') {
                    args = 'v=' + ideapark_wp_vars.scriptsHash;
                }
                return args ? (url.indexOf('?') === -1 ? '?' : '&') + args : '';
            },
            waitSeconds: 0
        });
        root.old_define = root.define;
        root.define = null;
    }
    root.ideapark_videos = [];
    root.ideapark_players = [];
    root.ideapark_env_init = false;
    root.ideapark_slick_paused = false;
    root.ideapark_is_mobile = false;
    root.old_windows_width = 0;
    var $window = $(window);
    var ideapark_all_is_loaded = false;
    var ideapark_mega_menu_initialized = 0;
    var $ideapark_masonry_grid = $('.js-post-masonry');
    var $ideapark_masonry_sidebar = $('.c-post-sidebar');
    var ideapark_post_with_thumb = $('.c-post-list--with-thumb').length > 0;
    var ideapark_post_no_thumb = $('.c-post-list--no-thumb').length > 0;
    var ideapark_masonry_grid_on = !!$ideapark_masonry_grid.length && (ideapark_post_with_thumb && ideapark_post_no_thumb);
    var ideapark_masonry_sidebar_on = !!$ideapark_masonry_sidebar.length && $ideapark_masonry_sidebar.find('.widget').length > 2;
    var ideapark_is_masonry_init = false;
    var ideapark_masonry_sidebar_object = null;
    var $ideapark_store_notice_top = $('.woocommerce-store-notice--top');
    var $ideapark_mobile_advert_bar_above = $('.c-header__advert_bar--above');
    var ideapark_mobile_advert_bar_above_delta = 0;
    var $ideapark_mobile_menu = $('.js-mobile-menu');
    var ideapark_mobile_menu_initialized = false;
    var ideapark_mobile_menu_active = false;
    var ideapark_mobile_menu_page = -1;
    var $ideapark_shop_sidebar = $('.js-shop-sidebar');
    var $ideapark_shop_sidebar_wrap = $('.js-shop-sidebar-wrap');
    var ideapark_shop_sidebar_filter_desktop = !!$('.c-shop-sidebar--desktop-filter').length;
    var ideapark_shop_sidebar_initialized = false;
    var ideapark_shop_sidebar_active = false;
    var ideapark_search_popup_active = false;
    var $ideapark_page_header = $('.c-page-header');
    var ideapark_page_header_top;
    var ideapark_page_header_height;
    var $ideapark_desktop_sticky_row = $('.js-header-desktop');
    var $ideapark_mobile_sticky_row = $('.js-header-mobile');
    var $ideapark_header_outer = $('.c-header__outer--desktop');
    var ideapark_sticky_desktop_active = false;
    var ideapark_sticky_desktop_init = false;
    var ideapark_sticky_mobile_active = false;
    var ideapark_sticky_mobile_init = false;
    var $ideapark_sticky_sidebar = $('.js-sticky-sidebar');
    var $ideapark_sticky_sidebar_nearby = $('.js-sticky-sidebar-nearby');
    var ideapark_sticky_sidebar_old_style = null;
    var ideapark_is_sticky_sidebar_inner = !!$ideapark_sticky_sidebar_nearby.find('.js-sticky-sidebar').length;
    var $ideapark_to_top_button = $('.js-to-top-button');
    var $ideapark_quickview_container = $('.js-quickview-container');
    var $ideapark_quickview_popup = $('.js-quickview-popup');
    var $ideapark_simple_container = $('.js-simple-container');
    var ideapark_nav_text = ['<i class="ip-right h-carousel__prev"></i>', '<i class="ip-right h-carousel__next"></i>'];
    var $ideapark_header_row = $('.c-header--sticky');
    document.onreadystatechange = function() {
        if (document.readyState === 'complete') {
            ideapark_all_is_loaded = true;
            $('select.orderby').addClass('js-auto-width');
            ideapark_init_auto_select_width();
            ideapark_mega_menu_init();
        }
    };
    $(function() {
        $ideapark_to_top_button.on('click', function() {
            $('html, body').animate({
                scrollTop: 0
            }, 800);
        });
        $('.js-mobile-top-menu a[href^="#"], .js-top-menu a[href^="#"]').on('click', ideapark_hash_menu_animate);
        $('ul.wc-tabs a').on('click', function() {
            setTimeout(ideapark_sticky_sidebar, 100);
        });
        $ideapark_desktop_sticky_row.addClass('c-header--init');
        $('.js-login-form-toggle').on('click', function(e) {
            var $this = $(this);
            var $active_tab = $this.closest('.c-login__form');
            var $new_tab = $('.c-login__form:not(.c-login__form--active)');
            e.preventDefault();
            $active_tab.removeClass('c-login__form--active');
            $new_tab.addClass('c-login__form--active');
        });
        $(".js-wishlist-share-link").on('focus', function() {
            $(this).trigger('select');
            document.execCommand('copy');
        });
        $(document.body).on('keydown', function(e) {
            if (e.keyCode === 27) {
                $('button.js-callback-close').trigger('click');
                $('button.js-search-close').trigger('click');
                $('button.js-filter-close-button').trigger('click');
            }
            if (e.keyCode === 37 || e.keyCode === 39) {
                var $carousel = $('.js-single-product-carousel.owl-loaded');
                if ($carousel.length === 1) {
                    if (e.keyCode === 37) {
                        $carousel.trigger('prev.owl.carousel');
                    } else if (e.keyCode === 39) {
                        $carousel.trigger('next.owl.carousel');
                    }
                }
                var $nav_prev = $('.c-post__nav-prev');
                if ($nav_prev.length && e.keyCode === 37) {
                    document.location.href = $nav_prev.attr('href');
                }
                var $nav_next = $('.c-post__nav-next');
                if ($nav_next.length && e.keyCode === 39) {
                    document.location.href = $nav_next.attr('href');
                }
            }
        }).on('click', '.h-link-yes', function(e) {
            e.preventDefault();
            var $scope = $(this);
            if ($scope.data('ip-url') && $scope.data('ip-link') == 'yes') {
                if ($scope.data('ip-new-window') == 'yes') {
                    window.open($scope.data('ip-url'));
                } else {
                    location.href = $scope.data('ip-url');
                }
            }
        }).on('click', ".js-mobile-modal", function(e) {
            $(this).parent().find(".js-product-modal").first().trigger('click');
        }).on('click', ".js-product-modal", function(e) {
            e.preventDefault();
            var $button = $(this);
            var $play_button = $('.c-play', $button);
            var $button_loading = $play_button.length ? $play_button : $('.js-loading-wrap', $button);
            if ($button_loading.hasClass('js-loading')) {
                return;
            }
            var index = 0;
            if (ideapark_isset($button.data('index'))) {
                $button_loading.ideapark_button('loading', 25);
                index = $button.data('index');
            } else {
                $button_loading.ideapark_button('loading');
            }
            var $product = $button.closest('.product');
            var variation_id = $product.find('.variation_id').val();
            root.define = root.old_define;
            require(['photoswipe/photoswipe.min', 'photoswipe/photoswipe-ui-default.min', 'json!' + ideapark_wp_vars.ajaxUrl + '?action=ideapark_product_images&index=' + index + '&product_id=' + $button.data('product-id') + (!ideapark_empty(variation_id) ? '&variation_id=' + variation_id : '') + '!bust', 'css!' + ideapark_wp_vars.themeUri + '/assets/css/photoswipe/photoswipe', 'css!' + ideapark_wp_vars.themeUri + '/assets/css/photoswipe/default-skin/default-skin'], function(PhotoSwipe, PhotoSwipeUI_Default, images) {
                root.define = null;
                $button_loading.ideapark_button('reset');
                if (images.images.length) {
                    var options = {
                        index: index ? index : 0,
                        showHideOpacity: true,
                        bgOpacity: 1,
                        loop: false,
                        closeOnVerticalDrag: false,
                        mainClass: '',
                        barsSize: {
                            top: 0,
                            bottom: 0
                        },
                        captionEl: false,
                        fullscreenEl: false,
                        zoomEl: true,
                        shareEl: false,
                        counterEl: false,
                        tapToClose: true,
                        tapToToggleControls: false
                    };
                    var pswpElement = $('.pswp')[0];
                    ideapark_wpadminbar_resize();
                    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, images.images, options);
                    gallery.init();
                    gallery.listen('afterChange', function() {
                        if (!ideapark_empty(gallery.currItem.html)) {}
                    });
                    gallery.listen('close', function() {
                        $('.pswp__video-wrap').html('');
                    });
                }
            });
        }).on('click', ".js-video", function(e) {
            e.preventDefault();
            ideapark_init_venobox($(this));
        }).on('click', ".js-ajax-search-all", function(e) {
            $(this).closest('.js-ajax-search').find('.js-search-form').submit();
        }).on('click', '.js-load-more', function(e) {
            var $button = $(this);
            var $catalog = $button.closest('.js-catalog');
            var $grid = $catalog.find('.js-grid');
            e.preventDefault();
            if ($button.hasClass('js-loading')) {
                return;
            }
            $button.ideapark_button('loading', 19);
            $.ajax({
                url: ideapark_wp_vars.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'ideapark_ajax_load_more',
                    type: $button.data('type'),
                    cat: $button.data('cat'),
                    page: $button.data('page'),
                    limit: $button.data('limit'),
                    sort: $button.data('sort'),
                },
                success: function(results) {
                    $button.ideapark_button('reset');
                    if (results.items) {
                        $grid.append(results.items);
                        setTimeout(function() {
                            $('.c-item--just-loaded').removeClass('c-item--just-loaded');
                        }, 100);
                    }
                    if (ideapark_isset(results.button)) {
                        $button.replaceWith(results.button);
                    }
                }
            });
        }).on('wc_cart_button_updated', function(e, $button) {
            var $view_cart_button = $button.parent().find('.added_to_cart');
            $view_cart_button.addClass('c-product-grid__atc');
        }).on('click', '.js-notice-close', function(e) {
            e.preventDefault();
            var $notice = $(this).closest('.woocommerce-notice');
            $notice.animate({
                opacity: 0,
            }, 500, function() {
                $notice.remove();
            });
        }).on('adding_to_cart', function(e, $button) {
            $button.ideapark_button('loading', 16);
        }).on('added_to_cart', function(e, fragments, cart_hash, $button) {
            if (typeof $button !== 'undefined' && $button && $button.lenght) {
                $button.ideapark_button('reset');
            }
            if (typeof fragments.ideapark_notice !== 'undefined') {
                ideapark_show_notice(fragments.ideapark_notice);
            }
        }).on('wc_fragments_loaded wc_fragment_refresh wc_fragments_refreshed', function(e) {
            if (ideapark_masonry_sidebar_object) {
                ideapark_masonry_sidebar_object.layout();
            }
        }).on('click', ".js-quantity-minus", function(e) {
            e.preventDefault();
            var $input = $(this).parent().find('input[type=number]');
            var quantity = $input.val().trim();
            var min = $input.attr('min');
            quantity--;
            if (quantity < (min !== '' ? min : 1)) {
                quantity = (min !== '' ? min : 1);
            }
            $input.val(quantity);
            $input.trigger('change');
        }).on('click', ".js-quantity-plus", function(e) {
            e.preventDefault();
            var $input = $(this).parent().find('input[type=number]');
            var quantity = $input.val().trim();
            var max = $input.attr('max');
            quantity++;
            if ((max !== '') && (quantity > max)) {
                quantity = max;
            }
            if (quantity > 0) {
                $input.val(quantity);
                $input.trigger('change');
            }
        }).on('click', '.js-cart-coupon', function(e) {
            e.preventDefault();
            var $coupon = $(".c-cart__coupon-from-wrap");
            $coupon.toggleClass('c-cart__coupon-from-wrap--opened');
            $('.c-cart__select-icon').toggleClass('c-cart__select-icon--opened');
            if ($coupon.hasClass('c-cart__coupon-from-wrap--opened')) {
                setTimeout(function() {
                    $coupon.find('input[type=text]').first().trigger('focus');
                }, 500);
            }
            return false;
        }).on('checkout_error updated_checkout applied_coupon removed_coupon', function() {
            var $notices = $('div.woocommerce-notice:not(.shown), div.woocommerce-error:not(.shown), div.woocommerce-message:not(.shown)');
            if ($notices.length) {
                $notices.detach();
                ideapark_show_notice($notices);
            }
        }).on('click', "#ip-checkout-apply-coupon", function() {
            var params = null;
            var is_cart = false;
            if (typeof wc_checkout_params != 'undefined') {
                params = wc_checkout_params;
                is_cart = false;
            }
            if (typeof wc_cart_params != 'undefined') {
                params = wc_cart_params;
                is_cart = true;
            }
            if (!params) {
                return false;
            }
            var $collaterals = $(this).closest('.c-cart__collaterals');
            if ($collaterals.is('.processing')) {
                return false;
            }
            $collaterals.addClass('processing').block({
                message: null,
                overlayCSS: {
                    background: '#fff',
                    opacity: 0.6
                }
            });
            var data = {
                security: params.apply_coupon_nonce,
                coupon_code: $collaterals.find('input[name="coupon_code"]').val()
            };
            $.ajax({
                type: 'POST',
                url: params.wc_ajax_url.toString().replace('%%endpoint%%', 'apply_coupon'),
                data: data,
                success: function(code) {
                    if (code) {
                        ideapark_show_notice(code);
                        if (is_cart) {
                            $.ajax({
                                url: params.wc_ajax_url.toString().replace('%%endpoint%%', 'get_cart_totals'),
                                dataType: 'html',
                                success: function(response) {
                                    $collaterals.html(response);
                                },
                                complete: function() {
                                    $collaterals.removeClass('processing').unblock();
                                }
                            });
                        } else {
                            $collaterals.removeClass('processing').unblock();
                            $(document.body).trigger('update_checkout', {
                                update_shipping_method: false
                            });
                        }
                    }
                },
                dataType: 'html'
            });
            return false;
        }).on('click', 'a.woocommerce-review-link', function(e) {
            e.preventDefault();
            var $quickview_container = $(this).closest('.c-product--quick-view');
            if ($quickview_container.length) {
                var product_url = $quickview_container.find('.woocommerce-LoopProduct-link').first().attr('href') + '#reviews';
                document.location.href = product_url;
                return false;
            } else {
                setTimeout(function() {
                    ideapark_hash_menu_animate(e);
                }, 100);
            }
        }).on('click', '.woocommerce-store-notice__dismiss-link', function() {
            setTimeout(function() {
                $(document).trigger('ideapark.wpadminbar.scroll', ideapark_adminbar_visible_height);
            }, 100);
        }).on('click', '.c-product-grid__thumb-wrap a', function(e) {
            var width = $(window).width();
            var $this = $(this);
            var $item = $this.closest('.c-product-grid__item');
            var $atc = $item.find('.c-product-grid__atc');
            if (!ideapark_wp_vars.hideButtons) {
                if (width >= 360 && width <= 619 && $item.hasClass('c-product-grid__item--2-per-row') && (ideapark_wp_vars.withButtons || $atc.length && !$atc.hasClass('c-product-grid__atc--hide-mobile-2'))) {
                    e.preventDefault();
                } else if (ideapark_is_mobile_layout && $item.hasClass('c-product-grid__item--compact') && (ideapark_wp_vars.withButtons || $atc.length)) {
                    e.preventDefault();
                }
            }
        }).on('click', '.c-product-grid__thumb-wrap', function() {
            if (ideapark_is_mobile_layout && !ideapark_wp_vars.hideButtons) {
                var $this = $(this);
                if (!$this.hasClass('c-product-grid__thumb-wrap--hover')) {
                    $('.c-product-grid__thumb-wrap--hover').removeClass('c-product-grid__thumb-wrap--hover');
                    $this.addClass('c-product-grid__thumb-wrap--hover');
                }
            }
        });
        ideapark_wpadminbar_resize();
        ideapark_scroll_actions();
        ideapark_resize_actions();
        ideapark_init_mobile_menu();
        ideapark_init_notice();
        ideapark_init_masonry();
        ideapark_init_subcat_carousel();
        ideapark_init_ajax_add_to_cart();
        ideapark_init_product_carousel();
        ideapark_init_product_thumbs_carousel();
        if (ideapark_is_mobile_layout) {
            ideapark_init_shop_sidebar();
        }
        ideapark_scroll_action_add(function() {
            ideapark_to_top_button();
            ideapark_sticky_sidebar();
            ideapark_header_sticky();
            ideapark_advert_bar();
        });
        ideapark_resize_action_layout_add(function() {
            ideapark_search_popup(false);
            ideapark_header_sticky_init();
            ideapark_mobile_menu_popup(false);
            ideapark_init_mobile_menu();
            ideapark_init_shop_sidebar();
            ideapark_sticky_sidebar();
            ideapark_header_sticky();
            ideapark_mega_menu_init();
            ideapark_init_zoom();
        });
        ideapark_defer_action_add(function() {
            ideapark_header_sticky_init(true);
            ideapark_header_sticky();
            ideapark_init_top_menu();
            ideapark_init_search();
            ideapark_init_zoom();
            ideapark_init_shop_sidebar();
            ideapark_init_product_layout();
            ideapark_init_post_image_carousel();
            ideapark_init_tabs_carousel();
            ideapark_init_callback_popup();
            ideapark_init_quickview_popup();
            ideapark_init_review_placeholder();
            ideapark_grid_color_var_init();
            ideapark_resize_action_500_add(function() {
                ideapark_init_tabs_carousel();
                ideapark_init_masonry();
                ideapark_init_subcat_carousel();
                if (ideapark_is_mobile_layout) {
                    $('.c-product-grid__thumb-wrap--hover').removeClass('c-product-grid__thumb-wrap--hover');
                }
            });
            $('.c-play--disabled').removeClass('c-play--disabled');
            $('.entry-content').fitVids();
            $(document.body).trigger('ideapark.wpadminbar.scroll', ideapark_adminbar_visible_height).trigger('theme_init');
        });
        if (!ideapark_wp_vars.jsDelay || ideapark_wp_vars.elementorPreview || ($window.width() >= 768 && $window.width() <= 1189)) {
            ideapark_defer_action_run();
        }
        $(document).on('ideapark.wpadminbar.scroll ideapark.sticky', ideapark_set_notice_offset).trigger('ideapark.wpadminbar.scroll', ideapark_adminbar_visible_height);
        $('body.h-preload').removeClass('h-preload');
    });
    root.ideapark_grid_color_var_init = function() {
        var ideapark_color_var_timeout = null;
        $('.js-grid-color-var').on('click', function() {
            if (ideapark_color_var_timeout !== null) {
                clearTimeout(ideapark_color_var_timeout);
                ideapark_color_var_timeout = null;
            }
            var $this = $(this);
            var $product = $this.closest('.c-product-grid__item');
            var $image = $product.find('.c-product-grid__thumb').first();
            if ($this.hasClass('current')) {
                $product.find('.c-product-grid__color-item.current').removeClass('current hover');
                $image.attr('src', $image.data('src'));
                $image.attr('srcset', $image.data('srcset'));
                $product.find('.c-product-grid__thumb-button-list').show();
                $product.find('.c-product-grid__atc').show();
                return;
            }
            $product.find('.c-product-grid__color-item.current').removeClass('current hover');
            if (ideapark_is_mobile_layout || !$product.hasClass('c-product-grid__item--always')) {
                if (!(ideapark_is_mobile_layout && $product.hasClass('c-product-grid__item--1-per-row'))) {
                    $product.find('.c-product-grid__thumb-button-list').hide();
                    $product.find('.c-product-grid__atc').hide();
                }
            }
            $this.addClass('current hover');
            if ($image.length) {
                if (typeof $image.data('src') === 'undefined') {
                    $image.data('src', $image.attr('src'));
                    $image.data('srcset', $image.attr('srcset'));
                }
                $image.attr('src', $this.data('src'));
                $image.attr('srcset', $this.data('srcset'));
            }
        }).on('mouseout', function() {
            var $this = $(this);
            $this.removeClass('hover');
            if ($this.hasClass('current') && ideapark_color_var_timeout === null) {
                ideapark_color_var_timeout = setTimeout(function() {
                    var $product = $this.closest('.c-product-grid__item');
                    $product.find('.c-product-grid__thumb-button-list').show();
                    $product.find('.c-product-grid__atc').show();
                    ideapark_color_var_timeout = null;
                }, 800);
            }
        });
    };
    root.ideapark_search_popup = function(show) {
        if (show && !ideapark_search_popup_active) {
            ideapark_mobile_menu_popup(false);
            ideapark_search_popup_active = true;
            $('.c-header-search').addClass('c-header-search--active');
            bodyScrollLock.disableBodyScroll($('.c-header-search__result')[0]);
        } else if (ideapark_search_popup_active) {
            ideapark_search_popup_active = false;
            $('.c-header-search').removeClass('c-header-search--active');
            bodyScrollLock.clearAllBodyScrollLocks();
        }
    };
    root.ideapark_init_top_menu = function() {
        var $ideapark_top_menu = $('.js-top-menu');
        if ($ideapark_top_menu.length) {
            $ideapark_top_menu.find('.c-top-menu__subitem--has-children').each(function() {
                var $li = $(this);
                if ($li.find('ul').length) {
                    $li.append('<i class="ip-menu-right c-top-menu__more-svg"></i>');
                } else {
                    $li.removeClass('c-top-menu__subitem--has-children');
                }
            });
            $ideapark_top_menu.find('a[href^="#"]').on('click', ideapark_hash_menu_animate);
        }
    };
    root.ideapark_advert_bar = function() {
        if (ideapark_sticky_mobile_init && ideapark_is_mobile_layout && $ideapark_mobile_sticky_row.length && ($ideapark_mobile_advert_bar_above.length || $ideapark_store_notice_top.length && $ideapark_store_notice_top.css('display') !== 'none')) {
            var scroll_top_mobile = window.scrollY;
            var advert_bar_height = ($ideapark_mobile_advert_bar_above.length ? $ideapark_mobile_advert_bar_above.outerHeight() : 0) + ($ideapark_store_notice_top.length && $ideapark_store_notice_top.css('display') !== 'none' ? $ideapark_store_notice_top.outerHeight() : 0);
            if (scroll_top_mobile - ideapark_adminbar_height < advert_bar_height && (!ideapark_adminbar_visible_height || ideapark_adminbar_position === 'fixed')) {
                $(document).trigger('ideapark.wpadminbar.scroll', ideapark_adminbar_visible_height);
            } else if (ideapark_mobile_advert_bar_above_delta > 0 && (!ideapark_adminbar_visible_height || ideapark_adminbar_position === 'fixed')) {
                $(document).trigger('ideapark.wpadminbar.scroll', ideapark_adminbar_visible_height);
            }
        }
    };
    root.ideapark_header_sticky_wpadmin = function(event, wpadminbar_height) {
        if (ideapark_sticky_desktop_init && !ideapark_is_mobile_layout && $ideapark_desktop_sticky_row.length) {
            $ideapark_desktop_sticky_row.css({
                top: wpadminbar_height + 'px'
            });
        }
        if (ideapark_sticky_mobile_init && ideapark_is_mobile_layout && $ideapark_mobile_sticky_row.length) {
            var top = wpadminbar_height;
            if ($ideapark_mobile_advert_bar_above.length || $ideapark_store_notice_top.length && $ideapark_store_notice_top.css('display') !== 'none') {
                var scroll_top_mobile = window.scrollY;
                var advert_bar_height = ($ideapark_mobile_advert_bar_above.length ? $ideapark_mobile_advert_bar_above.outerHeight() : 0) + ($ideapark_store_notice_top.length && $ideapark_store_notice_top.css('display') !== 'none' ? $ideapark_store_notice_top.outerHeight() : 0);
                if (scroll_top_mobile - ideapark_adminbar_height < advert_bar_height) {
                    var delta;
                    if (ideapark_adminbar_position === 'fixed') {
                        delta = (advert_bar_height - scroll_top_mobile);
                    } else if (top > 0) {
                        delta = advert_bar_height;
                    } else {
                        delta = (advert_bar_height - scroll_top_mobile + ideapark_adminbar_height);
                    }
                    if (delta < 0) {
                        delta = 0;
                    }
                    ideapark_mobile_advert_bar_above_delta = delta;
                    top += delta;
                } else {
                    ideapark_mobile_advert_bar_above_delta = 0;
                }
            }
            $ideapark_mobile_sticky_row.css({
                top: top + 'px'
            });
        }
    };
    root.ideapark_header_sticky_init = function(force) {
        ideapark_page_header_top = $ideapark_page_header.length ? $ideapark_page_header.offset().top : 0;
        ideapark_page_header_height = $ideapark_page_header.length ? $ideapark_page_header.outerHeight() : 0;
        if ((!ideapark_sticky_desktop_init || force) && !ideapark_is_mobile_layout && ideapark_wp_vars.stickyMenuDesktop && $ideapark_desktop_sticky_row.length) {
            ideapark_sticky_desktop_active = false;
            ideapark_sticky_desktop_init = true;
        }
        if ((!ideapark_sticky_mobile_init || force) && ideapark_is_mobile_layout) {
            ideapark_sticky_mobile_active = false;
            ideapark_sticky_mobile_init = true;
        }
        $(document).off('ideapark.wpadminbar.scroll', ideapark_header_sticky_wpadmin);
        $(document).on('ideapark.wpadminbar.scroll', ideapark_header_sticky_wpadmin);
    };
    root.ideapark_header_sticky = function() {
        var scroll_top, header_height, is_sticky_area;
        if (ideapark_wp_vars.stickyMenuDesktop && ideapark_sticky_desktop_init && !ideapark_is_mobile_layout) {
            if ($ideapark_desktop_sticky_row.length) {
                scroll_top = window.scrollY;
                if (ideapark_wp_vars.headerType == 'header-type-1' || ideapark_wp_vars.headerType == 'header-type-3' || ideapark_wp_vars.headerType == 'header-type-4' || ideapark_wp_vars.headerType == 'header-type-5') {
                    header_height = 150;
                    is_sticky_area = scroll_top + ideapark_adminbar_height >= ideapark_page_header_top + header_height;
                } else if (ideapark_wp_vars.headerType == 'header-type-2') {
                    header_height = ideapark_page_header_top + 30;
                    if (header_height < 240) {
                        header_height = 240;
                    }
                    is_sticky_area = scroll_top + ideapark_adminbar_height >= header_height;
                }
                if (ideapark_sticky_desktop_active) {
                    if (!is_sticky_area) {
                        var f = function() {
                            f = null;
                            if (ideapark_wp_vars.headerType == 'header-type-2' || ideapark_wp_vars.headerType == 'header-type-4' || ideapark_wp_vars.headerType == 'header-type-5') {
                                $ideapark_header_outer.css({
                                    'min-height': ''
                                });
                            }
                            $ideapark_desktop_sticky_row.removeClass('c-header--transition c-header--sticky');
                        };
                        var f2 = function() {
                            if (f) {
                                f();
                            }
                        };
                        ideapark_on_transition_end_callback($ideapark_desktop_sticky_row, f2);
                        setTimeout(f2, 500);
                        $ideapark_desktop_sticky_row.removeClass('c-header--active');
                        ideapark_sticky_desktop_active = false;
                        $(document).trigger('ideapark.sticky');
                    }
                } else {
                    if (is_sticky_area) {
                        if (ideapark_wp_vars.headerType == 'header-type-2' || ideapark_wp_vars.headerType == 'header-type-4' || ideapark_wp_vars.headerType == 'header-type-5') {
                            $ideapark_header_outer.css({
                                'min-height': $ideapark_header_outer.outerHeight() + 'px'
                            });
                        }
                        $ideapark_desktop_sticky_row.addClass('c-header--sticky');
                        ideapark_sticky_desktop_active = true;
                        setTimeout(function() {
                            $ideapark_desktop_sticky_row.addClass('c-header--transition c-header--active');
                        }, 50);
                        $(document).trigger('ideapark.sticky');
                    }
                }
            }
        }
        if (ideapark_wp_vars.stickyMenuMobile && ideapark_sticky_mobile_init && ideapark_is_mobile_layout) {
            if ($ideapark_mobile_sticky_row.length) {
                scroll_top = window.scrollY;
                is_sticky_area = scroll_top > 5 && (!ideapark_adminbar_visible_height || ideapark_adminbar_position === 'fixed') && !ideapark_mobile_advert_bar_above_delta;
                if (ideapark_sticky_mobile_active) {
                    if (!is_sticky_area) {
                        $ideapark_mobile_sticky_row.removeClass('c-header--sticky');
                        ideapark_sticky_mobile_active = false;
                        $(document).trigger('ideapark.sticky');
                    }
                } else {
                    if (is_sticky_area) {
                        $ideapark_mobile_sticky_row.addClass('c-header--sticky');
                        ideapark_sticky_mobile_active = true;
                        $(document).trigger('ideapark.sticky');
                    }
                }
                $ideapark_mobile_sticky_row.addClass('c-header--init');
            }
        }
    };
    root.ideapark_init_search = function() {
        $('.js-ajax-search').each(function() {
            var $ideapark_search = $(this);
            var $ideapark_search_result = $('.js-ajax-search-result', $ideapark_search);
            var $ideapark_search_form = $('.js-search-form', $ideapark_search);
            var $ideapark_search_input = $('.js-ajax-search-input', $ideapark_search);
            var $ideapark_search_type = $('.js-ajax-search-type', $ideapark_search);
            var $ideapark_search_clear = $('.js-search-clear', $ideapark_search);
            var $ideapark_search_loader = $('<i class="h-loading c-header-search__loading"></i>');
            var ideapark_search_input_filled = false;
            var ajaxSearchFunction = ideapark_debounce(function() {
                var search = $ideapark_search_input.val().trim();
                if (ideapark_empty(search)) {
                    $ideapark_search_result.html('');
                } else {
                    $ideapark_search_loader.insertBefore($ideapark_search_input);
                    $.ajax({
                        url: ideapark_wp_vars.ajaxUrl,
                        type: 'POST',
                        data: {
                            action: 'ideapark_ajax_search',
                            s: search,
                            post_type: $ideapark_search_type.val(),
                            lang: $('input[name="lang"]', $ideapark_search_form).val()
                        },
                        success: function(results) {
                            $ideapark_search_loader.remove();
                            $ideapark_search_result.html((ideapark_empty($ideapark_search_input.val().trim())) ? '' : results);
                        }
                    });
                }
            }, 500);
            $ideapark_search_input.on('keydown', function(e) {
                var $this = $(this);
                var is_not_empty = !ideapark_empty($this.val().trim());
                if (e.keyCode == 13) {
                    e.preventDefault();
                    if ($this.hasClass('no-ajax') && is_not_empty) {
                        $this.closest('form').submit();
                    }
                } else if (e.keyCode == 27) {
                    ideapark_search_popup(false);
                }
            }).on('input', function() {
                var $this = $(this);
                var is_not_empty = !ideapark_empty($this.val().trim());
                if (is_not_empty && !ideapark_search_input_filled) {
                    ideapark_search_input_filled = true;
                    $('.js-search-clear').addClass('active');
                } else if (!is_not_empty && ideapark_search_input_filled) {
                    ideapark_search_input_filled = false;
                    $('.js-search-clear').removeClass('active');
                }
                ajaxSearchFunction();
            });
            $ideapark_search_clear.on('click', function() {
                $ideapark_search_input.val('').trigger('input').trigger('focus');
            });
            $ideapark_search.removeClass('disabled');
        });
        $('.js-search-to-top').on('click', function() {
            $('html, body').animate({
                scrollTop: 0
            }, 800, function() {
                $('.c-header__search-input').trigger('focus');
            });
        });
        $('.js-search-button').on('click', function() {
            ideapark_search_popup(true);
            setTimeout(function() {
                $('.c-header-search__input').trigger('focus');
            }, 500);
        });
        $('.js-search-close').on('click', function() {
            if (ideapark_search_popup_active) {
                ideapark_on_transition_end_callback($('.c-header-search'), function() {
                    $('.c-header-search__input').val('').trigger('input').trigger('focus');
                });
                ideapark_search_popup(false);
            }
        });
        $(document).on('ideapark.wpadminbar.scroll', function(event, wpadminbar_height) {
            $('.c-header-search').css({
                transform: 'translateY(' + wpadminbar_height + 'px)',
                'max-height': 'calc(100% - ' + wpadminbar_height + 'px)'
            });
        });
    };
    root.ideapark_mobile_menu_popup = function(show) {
        if (ideapark_mobile_menu_initialized) {
            if (show && !ideapark_mobile_menu_active) {
                ideapark_mobile_menu_active = true;
                $ideapark_mobile_menu.addClass('c-header__menu--active');
            } else if (ideapark_mobile_menu_active) {
                ideapark_mobile_menu_active = false;
                $ideapark_mobile_menu.removeClass('c-header__menu--active');
                bodyScrollLock.clearAllBodyScrollLocks();
            }
        }
    };
    root.ideapark_init_mobile_menu = function() {
        var $wrap = $('.js-mobile-menu-wrap');
        var $back = $('.js-mobile-menu-back');
        var action_lock = false;
        var ideapark_mobile_menu_init_page = function(page, $ul) {
            var $page = $('<div class="c-header__menu-page js-menu-page" data-page="' + page + '"></div>');
            var $ul_new = $ul.clone();
            if (!page) {
                var $li = $('<li></li>');
                $('.js-mobile-blocks').clone().removeClass('.js-mobile-blocks').appendTo($li);
                $li.appendTo($ul_new);
            }
            $ul_new.appendTo($page);
            $page.appendTo($wrap);
        };
        var ideapark_mobile_menu_scroll_lock = function() {
            var $submenu = $('.js-menu-page[data-page="' + ideapark_mobile_menu_page + '"]');
            bodyScrollLock.clearAllBodyScrollLocks();
            bodyScrollLock.disableBodyScroll($submenu[0]);
        };
        if (ideapark_is_mobile_layout && !ideapark_mobile_menu_initialized && $ideapark_mobile_menu.length) {
            $(document).on('ideapark.wpadminbar.scroll', function(event, wpadminbar_height) {
                $ideapark_mobile_menu.css({
                    transform: 'translateY(' + wpadminbar_height + 'px)',
                    'max-height': 'calc(100% - ' + wpadminbar_height + 'px)'
                });
            });
            $ideapark_mobile_menu.find('.c-mobile-menu__item--has-children, .c-mobile-menu__subitem--has-children').each(function() {
                var $li = $(this);
                var $a = $li.children('a').first();
                var $ul_submenu = $li.children('.c-mobile-menu__submenu').first();
                if ($a.length && $ul_submenu.length) {
                    if ($a.attr('href') != '#' && $a.attr('href')) {
                        var $li_new = $ul_submenu.prop("tagName") == 'UL' ? $('<li class="c-mobile-menu__subitem c-mobile-menu__subitem--parent"></li>') : $('<div class="c-mobile-menu__subitem c-mobile-menu__subitem--parent c-mobile-menu__subitem--parent-div"></div>');
                        $a.clone().appendTo($li_new);
                        $ul_submenu.prepend($li_new);
                    }
                }
            });
            $(document.body).on('click', '.c-mobile-menu__item--has-children > a:first-child, .c-mobile-menu__subitem--has-children > a:first-child', function(e) {
                e.preventDefault();
                if (action_lock) {
                    return;
                }
                action_lock = true;
                var $submenu = $(this).closest('li').children('.c-mobile-menu__submenu');
                ideapark_mobile_menu_page++;
                ideapark_mobile_menu_init_page(ideapark_mobile_menu_page, $submenu);
                ideapark_on_transition_end_callback($wrap, function() {
                    action_lock = false;
                });
                $wrap.addClass('c-header__menu-wrap--page-' + ideapark_mobile_menu_page);
                $back.addClass('c-header__menu-back--active');
                ideapark_mobile_menu_scroll_lock();
            });
            $back.on('click', function() {
                if (action_lock || ideapark_mobile_menu_page <= 0) {
                    return;
                }
                action_lock = true;
                ideapark_on_transition_end_callback($wrap, function() {
                    $('.js-menu-page[data-page="' + ideapark_mobile_menu_page + '"]').remove();
                    ideapark_mobile_menu_page--;
                    if (!ideapark_mobile_menu_page) {
                        $back.removeClass('c-header__menu-back--active');
                    }
                    ideapark_mobile_menu_scroll_lock();
                    action_lock = false;
                });
                $wrap.removeClass('c-header__menu-wrap--page-' + ideapark_mobile_menu_page);
            });
            $('.js-mobile-menu-open').on('click', function() {
                if (ideapark_mobile_menu_page === -1) {
                    ideapark_mobile_menu_page = 0;
                    ideapark_mobile_menu_init_page(ideapark_mobile_menu_page, $('.c-mobile-menu__list'));
                }
                ideapark_mobile_menu_popup(true);
                ideapark_mobile_menu_scroll_lock();
            });
            $('.js-mobile-menu-close').on('click', function() {
                ideapark_mobile_menu_popup(false);
            });
            ideapark_mobile_menu_initialized = true;
        }
    };
    root.ideapark_sidebar_popup = function(show) {
        if (ideapark_shop_sidebar_initialized) {
            if (show && !ideapark_shop_sidebar_active) {
                ideapark_shop_sidebar_active = true;
                $ideapark_shop_sidebar.addClass('c-shop-sidebar--active');
                $ideapark_shop_sidebar_wrap.addClass('c-shop-sidebar__wrap--active');
                $('body').addClass('filter-open');
            } else if (ideapark_shop_sidebar_active) {
                ideapark_shop_sidebar_active = false;
                $ideapark_shop_sidebar.removeClass('c-shop-sidebar--active');
                $ideapark_shop_sidebar_wrap.removeClass('c-shop-sidebar__wrap--active');
                $('body').removeClass('filter-open');
            }
        }
    };
    root.ideapark_init_shop_sidebar = function() {
        if ((ideapark_is_mobile_layout || !ideapark_is_mobile_layout && ideapark_shop_sidebar_filter_desktop) && !ideapark_shop_sidebar_initialized && $ideapark_shop_sidebar.length) {
            $(document).on('ideapark.wpadminbar.scroll', function(event, wpadminbar_height) {
                if (ideapark_is_mobile_layout || ideapark_shop_sidebar_filter_desktop) {
                    $ideapark_shop_sidebar.css({
                        transform: 'translateY(' + wpadminbar_height + 'px)',
                        'max-height': 'calc(100% - ' + wpadminbar_height + 'px)'
                    });
                } else {
                    $ideapark_shop_sidebar.css({
                        transform: '',
                        'max-height': ''
                    });
                }
            });
            $('.js-filter-show-button').on('click', function() {
                ideapark_sidebar_popup(true);
            });
            $('.js-filter-close-button').on('click', function() {
                ideapark_sidebar_popup(false);
            });
            ideapark_shop_sidebar_initialized = true;
        }
    };
    root.ideapark_init_post_image_carousel = function() {
        $('.js-post-image-carousel:not(.owl-carousel)').each(function() {
            var $this = $(this);
            if (!$this.closest('.js-news-carousel:not(.owl-drag)').length) {
                $this.addClass('owl-carousel').on('resized.owl.carousel', ideapark_owl_hide_arrows).owlCarousel({
                    items: 1,
                    center: false,
                    autoWidth: false,
                    loop: false,
                    margin: 0,
                    rtl: !!ideapark_wp_vars.isRtl,
                    nav: !$this.hasClass('h-carousel--nav-hide'),
                    dots: !$this.hasClass('h-carousel--dots-hide'),
                    navText: ideapark_nav_text,
                    onInitialized: ideapark_owl_hide_arrows
                }).on('changed.owl.carousel', function() {
                    ideapark_owl_hide_arrows($this);
                });
            }
        });
    };
    root.ideapark_init_product_carousel = function() {
        $('.js-single-product-carousel:not(.owl-carousel)').each(function() {
            var $this = $(this);
            var is_zoom = !!$this.find(".js-product-zoom").length;
            var is_zoom_mobile_hide = !!$this.find(".js-product-zoom--mobile-hide").length;
            if ($this.children().length > 1) {
                $this.addClass('owl-carousel').on('resized.owl.carousel', ideapark_owl_hide_arrows).owlCarousel({
                    items: 1,
                    center: false,
                    autoHeight: true,
                    loop: false,
                    mouseDrag: !is_zoom,
                    touchDrag: !is_zoom || is_zoom_mobile_hide,
                    margin: 0,
                    rtl: !!ideapark_wp_vars.isRtl,
                    nav: !$this.hasClass('h-carousel--nav-hide'),
                    dots: !$this.hasClass('h-carousel--dots-hide'),
                    navText: ideapark_nav_text,
                }).on('changed.owl.carousel', function(event) {
                    var currentItem = event.item.index;
                    $('.c-product__thumbs-item.active').removeClass('active');
                    $('.c-product__thumbs-item').eq(currentItem).addClass('active');
                    $('.js-product-thumbs-carousel').trigger('to.owl.carousel', [currentItem, 300]);
                });
            }
        });
    };
    root.ideapark_init_product_thumbs_carousel = function() {
        $('.js-product-thumbs-carousel:not(.owl-carousel)').each(function() {
            var $this = $(this);
            $this.addClass('owl-carousel').on('resized.owl.carousel', ideapark_owl_hide_arrows).owlCarousel({
                center: false,
                loop: false,
                margin: 0,
                autoWidth: true,
                rtl: !!ideapark_wp_vars.isRtl,
                nav: !$(this).hasClass('h-carousel--nav-hide'),
                dots: !$(this).hasClass('h-carousel--dots-hide'),
                navText: ideapark_nav_text,
                onInitialized: ideapark_owl_hide_arrows
            }).on('changed.owl.carousel', function() {
                ideapark_owl_hide_arrows($this);
            });
            $('.js-single-product-thumb:not(.init)', $(this)).addClass('init').on('click', function() {
                var index = $(this).data('index');
                var $item = $(this).closest('.c-product__thumbs-item');
                $('.c-product__thumbs-item.active').removeClass('active');
                $item.addClass('active');
                $('.js-single-product-carousel').trigger("to.owl.carousel", [index, 300]);
            });
        });
    };
    root.ideapark_init_tabs_carousel = function() {
        $('.js-tabs-list:not(.owl-carousel)').each(function() {
            var $this = $(this);
            var container_width = $this.closest('.c-product__tabs-wrap').outerWidth();
            var items_width = -46;
            $this.find('.c-product__tabs-item').each(function() {
                items_width += $(this).outerWidth() + 46;
            });
            if (items_width >= container_width) {
                $(this).addClass('owl-carousel').owlCarousel({
                    center: false,
                    loop: false,
                    margin: 46,
                    autoWidth: true,
                    rtl: !!ideapark_wp_vars.isRtl,
                    nav: !$(this).hasClass('h-carousel--nav-hide'),
                    dots: !$(this).hasClass('h-carousel--dots-hide'),
                    navText: ideapark_nav_text
                });
                $('.js-tabs-item-link', $(this)).on('click', function() {
                    var $this = $(this);
                    var index = $this.data('index');
                    $this.closest('.js-tabs-list').trigger("to.owl.carousel", [index, 300]);
                });
            }
        });
    };
    root.ideapark_init_auto_select_width = function() {
        var f = function() {
            var $this = $(this);
            var value = $this.val();
            var $cloned = $this.clone();
            $cloned.css({
                width: 'auto'
            });
            $cloned.addClass('h-invisible-total');
            $cloned.find('option:not([value=' + value + '])').remove();
            $this.after($cloned);
            var width = $cloned.outerWidth();
            $cloned.remove();
            $this.css({
                width: width + 'px'
            });
        };
        $('select.js-auto-width:not(.init)').on('change', f).each(f).addClass('init');
    };
    root.ideapark_to_top_button = function() {
        if ($ideapark_to_top_button.length) {
            if ($window.scrollTop() > 500) {
                if (!$ideapark_to_top_button.hasClass('c-to-top-button--active')) {
                    $ideapark_to_top_button.addClass('c-to-top-button--active');
                }
            } else {
                if ($ideapark_to_top_button.hasClass('c-to-top-button--active')) {
                    $ideapark_to_top_button.removeClass('c-to-top-button--active');
                }
            }
        }
    };
    root.ideapark_sticky_sidebar = function() {
        if (ideapark_wp_vars.stickySidebar && $ideapark_sticky_sidebar.length && $ideapark_sticky_sidebar_nearby.length) {
            var sb = $ideapark_sticky_sidebar;
            var content = $ideapark_sticky_sidebar_nearby;
            var is_disable_transition = false;
            var is_enable_transition = false;
            if (ideapark_is_mobile_layout) {
                if (ideapark_sticky_sidebar_old_style !== null) {
                    sb.attr('style', ideapark_sticky_sidebar_old_style);
                    ideapark_sticky_sidebar_old_style = null;
                }
            } else {
                var sb_height = sb.outerHeight(true);
                var content_height = content.outerHeight(true);
                var content_top = content.offset().top;
                var scroll_offset = $window.scrollTop();
                var window_width = $window.width();
                var top_panel_fixed_height = ideapark_sticky_desktop_active ? $ideapark_desktop_sticky_row.outerHeight() + ideapark_adminbar_visible_height + 25 : ideapark_adminbar_visible_height;
                if (sb_height < content_height && scroll_offset + top_panel_fixed_height > content_top) {
                    var sb_init = {
                        'position': 'undefined',
                        'float': 'none',
                        'top': 'auto',
                        'bottom': 'auto'
                    };
                    if (typeof ideapark_scroll_offset_last == 'undefined') {
                        root.ideapark_sb_top_last = content_top;
                        root.ideapark_scroll_offset_last = scroll_offset;
                        root.ideapark_scroll_dir_last = 1;
                        root.ideapark_window_width_last = window_width;
                    }
                    var scroll_dir = scroll_offset - ideapark_scroll_offset_last;
                    if (scroll_dir === 0) {
                        scroll_dir = ideapark_scroll_dir_last;
                    } else {
                        scroll_dir = scroll_dir > 0 ? 1 : -1;
                    }
                    var sb_big = sb_height + 30 >= $window.height() - top_panel_fixed_height,
                        sb_top = sb.offset().top;
                    if (sb_top < 0) {
                        sb_top = ideapark_sb_top_last;
                    }
                    if (sb_big) {
                        if (scroll_dir != ideapark_scroll_dir_last && sb.css('position') == 'fixed') {
                            sb_init.top = sb_top - content_top;
                            sb_init.position = 'absolute';
                        } else if (scroll_dir > 0) {
                            if (scroll_offset + $window.height() >= content_top + content_height + 30) {
                                if (ideapark_is_sticky_sidebar_inner) {
                                    sb_init.top = (content_height - sb_height) + 'px';
                                    is_disable_transition = true;
                                } else {
                                    sb_init.bottom = 0;
                                }
                                sb_init.position = 'absolute';
                            } else if (scroll_offset + $window.height() >= (sb.css('position') == 'absolute' ? sb_top : content_top) + sb_height + 30) {
                                sb_init.bottom = 30;
                                sb_init.position = 'fixed';
                                is_enable_transition = true;
                            }
                        } else {
                            if (scroll_offset + top_panel_fixed_height <= sb_top) {
                                sb_init.top = top_panel_fixed_height;
                                sb_init.position = 'fixed';
                                is_enable_transition = true;
                            }
                        }
                    } else {
                        if (scroll_offset + top_panel_fixed_height >= content_top + content_height - sb_height) {
                            if (ideapark_is_sticky_sidebar_inner) {
                                sb_init.top = (content_height - sb_height) + 'px';
                                is_disable_transition = true;
                            } else {
                                sb_init.bottom = 0;
                            }
                            sb_init.position = 'absolute';
                        } else {
                            sb_init.top = top_panel_fixed_height;
                            sb_init.position = 'fixed';
                            is_enable_transition = true;
                        }
                    }
                    if (is_disable_transition) {
                        is_disable_transition = false;
                        sb.addClass('js-sticky-sidebar--disable-transition');
                    }
                    if (sb_init.position != 'undefined') {
                        if (sb.css('position') != sb_init.position || ideapark_scroll_dir_last != scroll_dir || ideapark_window_width_last != window_width) {
                            root.ideapark_window_width_last = window_width;
                            sb_init.width = sb.parent().width();
                            if (ideapark_sticky_sidebar_old_style === null) {
                                var style = sb.attr('style');
                                if (!style) {
                                    style = '';
                                }
                                ideapark_sticky_sidebar_old_style = style;
                            }
                            sb.css(sb_init);
                        }
                    }
                    if (is_enable_transition) {
                        is_enable_transition = false;
                        setTimeout(function() {
                            sb.removeClass('js-sticky-sidebar--disable-transition');
                        }, 20);
                    }
                    root.ideapark_sb_top_last = sb_top;
                    root.ideapark_scroll_offset_last = scroll_offset;
                    root.ideapark_scroll_dir_last = scroll_dir;
                } else {
                    if (ideapark_sticky_sidebar_old_style !== null) {
                        sb.attr('style', ideapark_sticky_sidebar_old_style);
                        ideapark_sticky_sidebar_old_style = null;
                    }
                    setTimeout(function() {
                        sb.removeClass('js-sticky-sidebar--disable-transition');
                    }, 20);
                }
            }
        }
    };
    root.ideapark_hash_menu_animate = function(e) {
        var $this = $(this),
            $el;
        if (ideapark_isset(e)) {
            e.preventDefault();
            $this = $(e.target);
        }
        var element_selector = $this.attr('href');
        if ($('.c-product--layout-1').length && $('.c-product__tabs--wide').length == 0 && element_selector == '#reviews') {
            element_selector = ideapark_is_mobile_layout ? '.c-product__tabs--mobile .woocommerce-Reviews' : '.c-product__tabs--desktop .woocommerce-Reviews';
        }
        if (typeof element_selector !== 'undefined' && element_selector.length > 1 && ($el = $(element_selector)) && $el.length) {
            var offset = $el.offset().top - 25 - (ideapark_adminbar_position === 'fixed' ? ideapark_adminbar_height : 0);
            if (ideapark_is_mobile_layout) {
                ideapark_mobile_menu_popup(false);
                if ($ideapark_mobile_sticky_row.length) {
                    offset -= $ideapark_mobile_sticky_row.outerHeight();
                }
            } else if (ideapark_sticky_desktop_init && $ideapark_desktop_sticky_row.length) {
                offset -= $ideapark_desktop_sticky_row.outerHeight();
            }
            $('html, body').animate({
                scrollTop: offset
            }, 800);
        }
    };
    root.ideapark_owl_hide_arrows = function(event) {
        var $element;
        if (event instanceof jQuery) {
            $element = event;
        } else {
            $element = $(event.target);
        }
        var $prev = $element.find('.owl-prev');
        var $next = $element.find('.owl-next');
        var dot_count = $element.find('.owl-dot').length;
        if (!$element.hasClass('h-carousel--dots-hide')) {
            if (dot_count > 1) {
                $element.find('.owl-dots').removeClass('disabled');
            } else {
                $element.find('.owl-dots').addClass('disabled');
            }
        }
        if (!$element.hasClass('h-carousel--nav-hide')) {
            $element.find('.owl-nav').removeClass('disabled');
            if ($prev.length && $next.length) {
                if ($prev.hasClass('disabled') && $next.hasClass('disabled')) {
                    $prev.addClass('h-hidden');
                    $next.addClass('h-hidden');
                    $element.find('.owl-nav').addClass('disabled');
                } else {
                    $prev.removeClass('h-hidden');
                    $next.removeClass('h-hidden');
                }
            }
        }
    };
    // root.ideapark_init_product_layout = function() {
    //     var $layout_1 = $('.c-product--layout-1');
    //     if ($layout_1.length) {
    //         $('.c-product__tabs:not(.c-product__tabs--wide)').clone().removeClass('c-product__tabs--desktop').addClass('c-product__tabs--mobile').insertAfter($('.c-product__col-2'));
    //     }
    // };

    root.ideapark_init_product_layout = function() {
    var $layout_1 = $('.c-product--layout-1');
    if ($layout_1.length) {
        if (!$('.c-product__tabs--mobile').length) {
            console.log($('.c-product__tabs--mobile'));
            $('.c-product__tabs:not(.c-product__tabs--wide)').clone(true, true).removeClass('c-product__tabs--desktop').addClass('c-product__tabs--mobile').insertAfter($('.c-product__col-2'));
            if ($('.c-product__tabs--mobile').is(":visible")){
            $('.c-product__tabs--desktop').remove();

            }
            const tabs = document.querySelectorAll('.c-product__tabs-item-link');
            const tabContents = document.querySelectorAll('.wc-tab');

            function switchTab(event) {
                event.preventDefault();


                tabs.forEach(tab => tab.parentElement.classList.remove('active'));
                tabContents.forEach(content => {
                    content.style.display = 'none';
                    content.classList.remove('current', 'visible');
                });

                const targetTab = document.querySelector(this.getAttribute('href'));
                console.log(this.parentElement);
                this.parentElement.classList.add('active');
                targetTab.style.display = '';
                targetTab.classList.add('current', 'visible');
            }

            tabs.forEach(tab => {
                tab.addEventListener('click', switchTab);
                console.log(tab);
            });
        }
    }
};

    root.ideapark_get_notice_offset = function() {
        var $notice = $('.woocommerce-notices-wrapper--ajax');
        var offset = 0;
        if ($notice.length) {
            offset = ideapark_adminbar_visible_height;
            if (!ideapark_is_mobile_layout) {
                if (ideapark_sticky_desktop_active) {
                    offset += $ideapark_desktop_sticky_row.outerHeight();
                }
            } else {
                if (ideapark_sticky_mobile_active) {
                    offset += $ideapark_mobile_sticky_row.outerHeight();
                }
            }
        }
        return offset;
    };
    root.ideapark_set_notice_offset = function(offset) {
        var $notice = $('.woocommerce-notices-wrapper');
        if ($notice.length) {
            if (typeof offset !== 'number') {
                offset = ideapark_get_notice_offset();
            }
            $notice.css({
                transform: 'translateY(' + offset + 'px)',
            });
        }
    };
    root.ideapark_init_notice = function() {
        var $n1, $n2;
        var $wrapper = $('.woocommerce-notices-wrapper');
        if ($wrapper.length && $wrapper.hasClass('woocommerce-notices-wrapper--ajax')) {} else {
            if ($wrapper.length) {
                if ($wrapper.text().trim() != '') {
                    $n1 = $wrapper.find('.woocommerce-notice').detach();
                }
                $wrapper.remove();
            }
            $n2 = $('.woocommerce .woocommerce-notice').detach();
            var $header = $('.c-page-header');
            if (!$header.length) {
                $header = $('#main-header');
            }
            $wrapper = $('<div class="woocommerce-notices-wrapper woocommerce-notices-wrapper--ajax"></div>');
            $header.after($wrapper);
        }
        if ($n1 && $n1.length) {
            ideapark_show_notice($n1);
        }
        if ($n2 && $n2.length) {
            ideapark_show_notice($n2);
        }
    };
    root.ideapark_show_notice = function(notice) {
        if (ideapark_empty(notice)) {
            return;
        }
        var $wrapper = $('.woocommerce-notices-wrapper');
        var $notices = notice instanceof jQuery ? notice : $(notice);
        var is_new = !$wrapper.find('.woocommerce-notice').length;
        if (is_new) {
            $wrapper.css({
                display: 'none'
            });
        }
        $notices.addClass('shown');
        $wrapper.append($notices);
        if (is_new) {
            var dif = $wrapper.outerHeight() + 150;
            var top_orig = ideapark_is_mobile_layout ? 0 : parseInt($wrapper.css('top').replace('px', ''));
            $wrapper.css({
                top: (top_orig - dif) + 'px'
            });
            $wrapper.css({
                display: ''
            });
            $({
                y: top_orig
            }).animate({
                y: top_orig + dif
            }, {
                step: function(y) {
                    $wrapper.css({
                        top: (y - dif) + 'px',
                    });
                },
                duration: 500,
                complete: function() {
                    $wrapper.addClass('woocommerce-notices-wrapper--transition');
                }
            });
        }
        $notices.find('.js-notice-close').each(function() {
            var $close = $(this);
            setTimeout(function() {
                $close.trigger('click');
            }, 5000);
        });
    };
    root.ideapark_show_notice_error = function(message) {
        ideapark_show_notice($('<div class="woocommerce-notice  shown" role="alert">\n' + '\t\t<i class="ip-wc-error woocommerce-notice-error-svg"></i>\n' + '\t\t' + message + '\t\t<button class="h-cb h-cb--svg woocommerce-notice-close js-notice-close"><i class="ip-close-small woocommerce-notice-close-svg"></i></button>\n' + '\t</div>'));
    };
    root.ideapark_init_callback_popup = function() {
        var $ideapark_callback_popup = $('.js-callback-popup');
        if ($ideapark_callback_popup.length) {
            $ideapark_callback_popup.each(function() {
                var $popup = $(this);
                var open_popup = function(e) {
                    e.preventDefault();
                    ideapark_mobile_menu_popup(false);
                    $popup.removeClass('c-header__callback-popup--disabled');
                    setTimeout(function() {
                        $popup.addClass('c-header__callback-popup--active');
                    }, 20);
                    bodyScrollLock.disableBodyScroll($('.c-header__callback-wrap', $popup)[0]);
                };
                $popup.on('ip-open', open_popup);
                if ($popup.data('button')) {
                    $(document).on('click', $popup.data('button'), open_popup);
                }
                $('.js-callback-close', $popup).on('click', function() {
                    if ($popup.hasClass('c-header__callback-popup--active')) {
                        ideapark_on_transition_end_callback($popup, function() {
                            $('.c-header__callback-wrap').attr('class', 'c-header__callback-wrap');
                            $popup.addClass('c-header__callback-popup--disabled');
                        });
                        $popup.toggleClass('c-header__callback-popup--active');
                        bodyScrollLock.clearAllBodyScrollLocks();
                    }
                });
                $(document).on('ideapark.wpadminbar.scroll', function(event, wpadminbar_height) {
                    $popup.css({
                        transform: 'translateY(' + wpadminbar_height + 'px)',
                        'max-height': 'calc(100% - ' + wpadminbar_height + 'px)'
                    });
                });
            });
        }
    };
    root.ideapark_init_quickview_popup = function() {
        $('.js-grid-zoom').on('click', function() {
            var $button = $(this),
                ajax_url, product_id = $button.data('product-id'),
                data = {
                    product_id: product_id,
                    lang: $button.data('lang')
                };
            if (product_id) {
                if (typeof wc_add_to_cart_params !== 'undefined') {
                    ajax_url = wc_add_to_cart_params.wc_ajax_url.toString().replace('%%endpoint%%', 'ideapark_ajax_product');
                } else {
                    ajax_url = ideapark_wp_vars.ajaxUrl;
                    data.action = 'ideapark_ajax_product';
                }
                $.ajax({
                    type: 'POST',
                    url: ajax_url,
                    data: data,
                    dataType: 'html',
                    cache: false,
                    headers: {
                        'cache-control': 'no-cache'
                    },
                    beforeSend: function() {
                        $button.ideapark_button('loading', 16, true);
                    },
                    success: function(data) {
                        $ideapark_quickview_container.html(data);
                        var $currentContainer = $ideapark_quickview_popup.find('#product-' + product_id);
                        if ($currentContainer.hasClass('product-type-variable')) {
                            var $productForm = $currentContainer.find('form.cart');
                            $productForm.wc_variation_form().find('.variations select:eq(0)').trigger('change');
                        }
                        ideapark_init_product_carousel();
                        if (typeof IP_Wishlist !== 'undefined') {
                            IP_Wishlist.init_product_button();
                        }
                        $('.c-header__callback-wrap').addClass('c-header__callback-wrap--quickview');
                        $ideapark_quickview_popup.trigger('ip-open');
                        $button.ideapark_button('reset');
                        $('.c-play--disabled').removeClass('c-play--disabled');
                        ideapark_init_zoom();
                        ideapark_init_ajax_add_to_cart();
                    }
                });
            }
        });
    };
    root.ideapark_init_review_placeholder = function() {
        $('#reviews #commentform textarea, #reviews #commentform input, .woocommerce-Input--text').each(function() {
            var $this = $(this);
            var $label = $this.parent().find('label');
            if ($label.length) {
                $this.attr('placeholder', $label.text());
            }
        });
    };
    root.ideapark_init_masonry = function() {
        if (ideapark_masonry_grid_on || ideapark_masonry_sidebar_on) {
            var window_width = $window.width();
            var is_sidebar_masonry_width = window_width >= 630 && window_width <= 1189;
            if (!ideapark_is_masonry_init) {
                ideapark_is_masonry_init = true;
                if (ideapark_masonry_grid_on) {
                    $ideapark_masonry_grid.addClass('js-masonry');
                }
                var init_f = function() {
                    if (ideapark_masonry_sidebar_on && is_sidebar_masonry_width) {
                        ideapark_masonry_sidebar_object = new Masonry($ideapark_masonry_sidebar[0], {
                            itemSelector: '.widget',
                            percentPosition: true
                        });
                        $ideapark_masonry_sidebar.addClass('init-masonry');
                    }
                };
                if (typeof root.Masonry !== 'undefined') {
                    init_f();
                } else {
                    require([ideapark_wp_vars.masonryUrl], function() {
                        init_f();
                    });
                }
            } else {
                if (ideapark_masonry_sidebar_on) {
                    var is_init = $ideapark_masonry_sidebar.hasClass('init-masonry');
                    if (is_sidebar_masonry_width && !is_init) {
                        ideapark_masonry_sidebar_object = new Masonry($ideapark_masonry_sidebar[0], {
                            itemSelector: '.widget',
                            percentPosition: true
                        });
                        $ideapark_masonry_sidebar.addClass('init-masonry');
                    } else if (!is_sidebar_masonry_width && is_init) {
                        ideapark_masonry_sidebar_object.destroy();
                        ideapark_masonry_sidebar_object = null;
                        $ideapark_masonry_sidebar.removeClass('init-masonry');
                        setTimeout(function() {
                            $ideapark_masonry_sidebar.find('.widget').css({
                                left: '',
                                top: ''
                            });
                        }, 300);
                    }
                }
            }
        }
    };
    root.ideapark_menu_fix_position = function($ul) {
        if (!ideapark_is_mobile_layout && $ideapark_simple_container.length) {
            var delta;
            var window_width = $window.width();
            var is_fullwidth = !!$('.c-header--header-type-5').length;
            var container_width = is_fullwidth ? window_width - 60 : 1160;
            var container_left = is_fullwidth ? 30 : $ideapark_simple_container.offset().left;
            var container_right = container_left + container_width;
            var ul_left = $ul.offset().left;
            var ul_right = ul_left + $ul.width();
            if (ul_left < container_left) {
                if (ideapark_wp_vars.isRtl) {
                    delta = Math.round(parseInt($ul.css('right').replace('px', '')) - container_left + ul_left);
                    $ul.css({
                        right: delta
                    });
                } else {
                    delta = Math.round(parseInt($ul.css('left').replace('px', '')) + container_left - ul_left);
                    $ul.css({
                        left: delta
                    });
                }
            }
            if (ul_right > container_right) {
                if (ideapark_wp_vars.isRtl) {
                    delta = Math.round(parseInt($ul.css('right').replace('px', '')) + ul_right - container_right);
                    $ul.css({
                        right: delta
                    });
                } else {
                    delta = Math.round(parseInt($ul.css('left').replace('px', '')) - ul_right + container_right);
                    $ul.css({
                        left: delta
                    });
                }
            }
        }
    };
    root.ideapark_mega_menu_init = function() {
        if (!ideapark_is_mobile_layout && ideapark_mega_menu_initialized === 0 && ideapark_all_is_loaded) {
            var window_width = $window.width();
            $('.c-top-menu__submenu--columns-1').addClass('initialized').closest('li').addClass('initialized');
            var main_items = $('.c-top-menu__submenu--columns-2, .c-top-menu__submenu--columns-3, .c-top-menu__submenu--columns-4');
            if (main_items.length) {
                main_items.each(function() {
                    var $ul_main = $(this);
                    var cols = 1;
                    if ($ul_main.hasClass('c-top-menu__submenu--columns-2')) {
                        cols = 2;
                    } else if ($ul_main.hasClass('c-top-menu__submenu--columns-3')) {
                        cols = 3;
                    } else if ($ul_main.hasClass('c-top-menu__submenu--columns-4')) {
                        cols = 4;
                    }
                    var $ul = $ul_main;
                    var padding_top = $ul.css('padding-top') ? parseInt($ul.css('padding-top').replace('px', '')) : 0;
                    var padding_bottom = $ul.css('padding-bottom') ? parseInt($ul.css('padding-bottom').replace('px', '')) : 0;
                    var heights = [];
                    var max_height = 0;
                    var all_sum_height = 0;
                    $ul.children('li').each(function() {
                        var $li = $(this);
                        var height = $li.outerHeight();
                        if (height > max_height) {
                            max_height = height;
                        }
                        all_sum_height += height;
                        heights.push(height);
                    });
                    var test_cols = 0;
                    var cnt = 0;
                    var test_height = max_height - 1;
                    do {
                        test_height++;
                        cnt++;
                        test_cols = 1;
                        var sum_height = 0;
                        for (var i = 0; i < heights.length; i++) {
                            sum_height += heights[i];
                            if (sum_height > test_height) {
                                sum_height = 0;
                                i--;
                                test_cols++;
                            }
                        }
                    } while (test_cols > cols && cnt < 1000);
                    if (test_cols <= cols && test_height > 0) {
                        $ul.css({
                            height: (test_height + padding_top + padding_bottom) + 'px'
                        }).addClass('mega-menu-break');
                    }
                    ideapark_menu_fix_position($ul);
                    ideapark_resize_action_500_add(function() {
                        ideapark_menu_fix_position($ul);
                    });
                    $ul_main.addClass('initialized');
                    $ul_main.closest('li').addClass('initialized');
                });
            }
            $('.c-top-menu__submenu--inner').each(function() {
                var $ul = $(this);
                var cond = ideapark_wp_vars.isRtl ? ($ul.offset().left < 0) : ($ul.offset().left + $ul.width() > window_width);
                if (cond) {
                    $ul.addClass('c-top-menu__submenu--rtl');
                    $ul.closest('li').find('.c-top-menu__more-svg').addClass('c-top-menu__more-svg--rtl');
                }
            });
            $('.c-top-bar-menu__submenu,.wpml-ls-sub-menu').each(function() {
                var $ul = $(this);
                var cond = ideapark_wp_vars.isRtl ? ($ul.offset().left < 0) : ($ul.offset().left + $ul.width() > window_width);
                if (cond) {
                    $ul.addClass('c-top-bar-menu__submenu--rtl');
                    $ul.closest('.c-top-bar-menu__subitem').addClass('c-top-bar-menu__subitem--rtl');
                }
                $ul.addClass('initialized');
            });
            ideapark_mega_menu_initialized = 1;
        }
    };
    root.ideapark_init_zoom = function() {
        if (ideapark_is_mobile_layout) {
            $(".js-product-zoom--mobile-hide.init").each(function() {
                var $this = $(this);
                $this.removeClass('init').trigger('zoom.destroy');
            });
            $(".js-product-zoom:not(.js-product-zoom--mobile-hide):not(.init)").each(function() {
                var $this = $(this);
                $this.addClass('init').zoom({
                    url: $this.data('img'),
                    duration: 0,
                    onZoomIn: function() {
                        $(this).parent().addClass('zooming');
                    },
                    onZoomOut: function() {
                        $(this).parent().removeClass('zooming');
                    }
                });
            });
        } else {
            $(".js-product-zoom:not(.init)").each(function() {
                var $this = $(this);
                $this.addClass('init').zoom({
                    url: $this.data('img'),
                    duration: 0,
                    onZoomIn: function() {
                        $(this).parent().addClass('zooming');
                    },
                    onZoomOut: function() {
                        $(this).parent().removeClass('zooming');
                    }
                });
            });
        }
    };
    root.ideapark_init_subcat_carousel = function() {
        $('.js-header-subcat').each(function() {
            var $this = $(this);
            var container_width = $this.closest('.c-page-header__sub-cat').outerWidth();
            var items = 0;
            var items_width = 0;
            $this.find('.c-page-header__sub-cat-item').each(function() {
                items_width += $(this).outerWidth();
                items++;
            });
            if (items_width >= container_width && items > 1) {
                if (!$this.hasClass('d-carousel')) {
                    $this.addClass('owl-carousel').owlCarousel({
                        center: false,
                        margin: 0,
                        loop: false,
                        autoWidth: true,
                        rtl: !!ideapark_wp_vars.isRtl,
                        dots: !$this.hasClass('h-carousel--dots-hide'),
                        navText: ideapark_nav_text,
                        responsive: {
                            0: {
                                nav: false,
                            },
                            1190: {
                                nav: true,
                            },
                        }
                    });
                }
            } else if (items > 1) {
                if ($this.hasClass('owl-carousel')) {
                    $this.removeClass('owl-carousel').trigger("destroy.owl.carousel");
                }
            }
            $this.parent().addClass('c-page-header__sub-cat--init');
        });
    };
    root.ideapark_init_venobox = function($button) {
        if (root.VenoBox !== 'function') {
            var $play_button = $('.c-play', $button);
            var $button_loading = $play_button.length ? $play_button : $button;
            if ($button_loading.hasClass('js-loading')) {
                return;
            }
            $button_loading.ideapark_button('loading', 26);
            root.define = root.old_define;
            require(['venobox/venobox.min', 'css!' + ideapark_wp_vars.themeUri + '/assets/css/venobox/venobox.min', ], function(VenoBox) {
                root.define = null;
                $button_loading.ideapark_button('reset');
                root.VenoBox = VenoBox;
                new VenoBox({
                    selector: ".js-video,.js-ip-video"
                });
                VenoBox().open($button[0]);
            });
        }
    };
    root.ideapark_init_ajax_add_to_cart = function() {
        if (ideapark_wp_vars.ajaxAddToCart) {
            $('form.cart:not(.init)').on('submit', function(e) {
                if ($(this).closest('.product-type-external').length) {
                    return true;
                }
                e.preventDefault();
                var $form = $(this);
                var $button = $form.find('.single_add_to_cart_button:not(.disabled)');
                $form.block({
                    message: null,
                    overlayCSS: {
                        background: '#fff',
                        opacity: 0.6
                    }
                });
                var formData = new FormData($form[0]);
                formData.append('add-to-cart', $form.find('[name=add-to-cart]').val());
                if ($button.length) {
                    $button.ideapark_button('loading', 16);
                }
                $.ajax({
                    url: wc_add_to_cart_params.wc_ajax_url.toString().replace('%%endpoint%%', 'ip_add_to_cart'),
                    data: formData,
                    type: 'POST',
                    processData: false,
                    contentType: false,
                    complete: function(response) {
                        $button.ideapark_button('reset');
                        response = response.responseJSON;
                        if (!response) {
                            return;
                        }
                        if (response.error && response.product_url) {
                            window.location = response.product_url;
                            return;
                        }
                        if (wc_add_to_cart_params.cart_redirect_after_add === 'yes') {
                            window.location = wc_add_to_cart_params.cart_url;
                            return;
                        }
                        $(document.body).trigger('added_to_cart', [response.fragments, response.cart_hash, null]);
                        $form.unblock();
                    }
                });
            }).addClass('init');
        }
    };
    $.fn.extend({
        ideapark_button: function(option, size, ignore_size) {
            return this.each(function() {
                var $this = $(this);
                if (typeof size === 'undefined') {
                    size = 16;
                }
                if (option === 'loading' && !$this.hasClass('js-loading')) {
                    $this.data('button', $this.html());
                    if (!ignore_size) {
                        $this.data('css-width', $this.css('width'));
                        $this.data('css-height', $this.css('height'));
                    } else {
                        $this.data('ignore-size', $this.css('width'));
                    }
                    $this.css('height', $this.outerHeight());
                    $this.css('width', $this.outerWidth());
                    var $loader = $('<i class="h-loading"></i>');
                    $loader.css({
                        width: size + 'px',
                        height: size + 'px',
                    });
                    $this.html($loader);
                    $this.addClass('h-after-before-hide js-loading');
                } else if (option === 'reset' && $this.hasClass('js-loading')) {
                    var css_width = $this.data('css-width');
                    var css_height = $this.data('css-height');
                    var content = $this.data('button');
                    ignore_size = ignore_size || $this.data('ignore-size');
                    $this.data('button', '');
                    $this.data('css-width', '');
                    $this.data('css-height', '');
                    $this.data('ignore-size', '');
                    $this.html(content);
                    $this.removeClass('h-after-before-hide js-loading');
                    if (!ignore_size) {
                        $this.css('width', css_width);
                        $this.css('height', css_height);
                    } else {
                        $this.css('width', '');
                        $this.css('height', '');
                    }
                }
            });
        }
    });
    $.parseParams = function(query) {
        var re = /([^&=]+)=?([^&]*)/g;
        var decodeRE = /\+/g;
        var decode = function(str) {
            return decodeURIComponent(str.replace(decodeRE, " "));
        };
        var params = {},
            e;
        while (e = re.exec(query)) {
            var k = decode(e[1]),
                v = decode(e[2]);
            if (k.substring(k.length - 2) === '[]') {
                k = k.substring(0, k.length - 2);
                (params[k] || (params[k] = [])).push(v);
            } else params[k] = v;
        }
        return params;
    };
})(jQuery, window);
/*!
 * The Final Countdown for jQuery v2.2.0 (http://hilios.github.io/jQuery.countdown/)
 * Copyright (c) 2016 Edson Hilios
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
! function(a) {
    "use strict";
    "function" == typeof define && define.amd ? define(["jquery"], a) : a(jQuery)
}(function(a) {
    "use strict";

    function b(a) {
        if (a instanceof Date) return a;
        if (String(a).match(g)) return String(a).match(/^[0-9]*$/) && (a = Number(a)), String(a).match(/\-/) && (a = String(a).replace(/\-/g, "/")), new Date(a);
        throw new Error("Couldn't cast `" + a + "` to a date object.")
    }

    function c(a) {
        var b = a.toString().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        return new RegExp(b)
    }

    function d(a) {
        return function(b) {
            var d = b.match(/%(-|!)?[A-Z]{1}(:[^;]+;)?/gi);
            if (d)
                for (var f = 0, g = d.length; f < g; ++f) {
                    var h = d[f].match(/%(-|!)?([a-zA-Z]{1})(:[^;]+;)?/),
                        j = c(h[0]),
                        k = h[1] || "",
                        l = h[3] || "",
                        m = null;
                    h = h[2], i.hasOwnProperty(h) && (m = i[h], m = Number(a[m])), null !== m && ("!" === k && (m = e(l, m)), "" === k && m < 10 && (m = "0" + m.toString()), b = b.replace(j, m.toString()))
                }
            return b = b.replace(/%%/, "%")
        }
    }

    function e(a, b) {
        var c = "s",
            d = "";
        return a && (a = a.replace(/(:|;|\s)/gi, "").split(/\,/), 1 === a.length ? c = a[0] : (d = a[0], c = a[1])), Math.abs(b) > 1 ? c : d
    }
    var f = [],
        g = [],
        h = {
            precision: 100,
            elapse: !1,
            defer: !1
        };
    g.push(/^[0-9]*$/.source), g.push(/([0-9]{1,2}\/){2}[0-9]{4}( [0-9]{1,2}(:[0-9]{2}){2})?/.source), g.push(/[0-9]{4}([\/\-][0-9]{1,2}){2}( [0-9]{1,2}(:[0-9]{2}){2})?/.source), g = new RegExp(g.join("|"));
    var i = {
            Y: "years",
            m: "months",
            n: "daysToMonth",
            d: "daysToWeek",
            w: "weeks",
            W: "weeksToMonth",
            H: "hours",
            M: "minutes",
            S: "seconds",
            D: "totalDays",
            I: "totalHours",
            N: "totalMinutes",
            T: "totalSeconds"
        },
        j = function(b, c, d) {
            this.el = b, this.$el = a(b), this.interval = null, this.offset = {}, this.options = a.extend({}, h), this.firstTick = !0, this.instanceNumber = f.length, f.push(this), this.$el.data("countdown-instance", this.instanceNumber), d && ("function" == typeof d ? (this.$el.on("update.countdown", d), this.$el.on("stoped.countdown", d), this.$el.on("finish.countdown", d)) : this.options = a.extend({}, h, d)), this.setFinalDate(c), this.options.defer === !1 && this.start()
        };
    a.extend(j.prototype, {
        start: function() {
            null !== this.interval && clearInterval(this.interval);
            var a = this;
            this.update(), this.interval = setInterval(function() {
                a.update.call(a)
            }, this.options.precision)
        },
        stop: function() {
            clearInterval(this.interval), this.interval = null, this.dispatchEvent("stoped")
        },
        toggle: function() {
            this.interval ? this.stop() : this.start()
        },
        pause: function() {
            this.stop()
        },
        resume: function() {
            this.start()
        },
        remove: function() {
            this.stop.call(this), f[this.instanceNumber] = null, delete this.$el.data().countdownInstance
        },
        setFinalDate: function(a) {
            this.finalDate = b(a)
        },
        update: function() {
            if (0 === this.$el.closest("html").length) return void this.remove();
            var a, b = new Date;
            return a = this.finalDate.getTime() - b.getTime(), a = Math.ceil(a / 1e3), a = !this.options.elapse && a < 0 ? 0 : Math.abs(a), this.totalSecsLeft === a || this.firstTick ? void(this.firstTick = !1) : (this.totalSecsLeft = a, this.elapsed = b >= this.finalDate, this.offset = {
                seconds: this.totalSecsLeft % 60,
                minutes: Math.floor(this.totalSecsLeft / 60) % 60,
                hours: Math.floor(this.totalSecsLeft / 60 / 60) % 24,
                days: Math.floor(this.totalSecsLeft / 60 / 60 / 24) % 7,
                daysToWeek: Math.floor(this.totalSecsLeft / 60 / 60 / 24) % 7,
                daysToMonth: Math.floor(this.totalSecsLeft / 60 / 60 / 24 % 30.4368),
                weeks: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 7),
                weeksToMonth: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 7) % 4,
                months: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 30.4368),
                years: Math.abs(this.finalDate.getFullYear() - b.getFullYear()),
                totalDays: Math.floor(this.totalSecsLeft / 60 / 60 / 24),
                totalHours: Math.floor(this.totalSecsLeft / 60 / 60),
                totalMinutes: Math.floor(this.totalSecsLeft / 60),
                totalSeconds: this.totalSecsLeft
            }, void(this.options.elapse || 0 !== this.totalSecsLeft ? this.dispatchEvent("update") : (this.stop(), this.dispatchEvent("finish"))))
        },
        dispatchEvent: function(b) {
            var c = a.Event(b + ".countdown");
            c.finalDate = this.finalDate, c.elapsed = this.elapsed, c.offset = a.extend({}, this.offset), c.strftime = d(this.offset), this.$el.trigger(c)
        }
    }), a.fn.countdown = function() {
        var b = Array.prototype.slice.call(arguments, 0);
        return this.each(function() {
            var c = a(this).data("countdown-instance");
            if (void 0 !== c) {
                var d = f[c],
                    e = b[0];
                j.prototype.hasOwnProperty(e) ? d[e].apply(d, b.slice(1)) : null === String(e).match(/^[$A-Z_][0-9A-Z_$]*$/i) ? (d.setFinalDate.call(d, e), d.start()) : a.error("Method %s does not exist on jQuery.countdown".replace(/\%s/gi, e))
            } else new j(this, b[0], b[1])
        })
    }
});
(function($, root, undefined) {
    "use strict";
    var ideapark_nav_text = ['<i class="ip-right h-carousel__prev"></i>', '<i class="ip-right h-carousel__next"></i>'];
    var ideapark_on_transition_end = 'transitionend webkitTransitionEnd oTransitionEnd';
    var ideapark_nav_text_big = ['<i class="ip-right_big h-carousel__prev"></i>', '<i class="ip-right_big h-carousel__next"></i>'];
    var ideapark_is_rtl = $("body").hasClass('h-rtl');
    $(function() {
        ideapark_defer_action_add(function() {
            $(document).on('click', ".js-ip-video", function(e) {
                e.preventDefault();
                var $this = $(this);
                $this.attr('data-vbtype', 'video');
                $this.attr('data-autoplay', 'true');
                ideapark_init_venobox($this);
            });
            ideapark_init_slider_carousel();
            ideapark_init_woocommerce_widget_carousel();
            ideapark_init_news_widget_carousel();
            ideapark_init_video_widget_carousel();
            ideapark_init_reviews_widget_carousel();
            ideapark_init_image_list_1_carousel();
            ideapark_init_image_list_2_carousel();
            ideapark_init_team_widget_carousel();
            ideapark_init_gift_widget_carousel();
            ideapark_init_countdown();
            ideapark_init_accordion();
            ideapark_init_tabs();
            ideapark_init_banners();
            ideapark_resize_action_500_add(function() {
                ideapark_init_tabs(true);
                ideapark_init_image_list_1_carousel();
                ideapark_init_image_list_2_carousel();
            });
        });
    });
    root.ideapark_init_slider_carousel = function() {
        var need_load_animation = false;
        var draw_timer = [];
        var radius = 7;
        var arcs = [];
        var angle = 0;
        var i = 0;
        var d = 'M0,0 ';
        arcs[0] = d;
        do {
            angle += 5;
            angle %= 365;
            var radians = ((-angle - 90) / 180) * Math.PI;
            var x = Math.round((radius + 1 + Math.cos(radians) * radius) * 100) / 100;
            var y = Math.round((radius + 1 + Math.sin(radians) * radius) * 100) / 100;
            if (i === 0) {
                d += " M " + x + " " + y;
            } else {
                d += " L " + x + " " + y;
            }
            arcs[angle] = d;
            i++;
        } while (angle != 360);
        var drawCircle = function(circle_id, timeout) {
            var angle = 365;
            var circle = document.getElementById(circle_id);
            if (circle) {
                for (var index in draw_timer) {
                    if (draw_timer[index]) {
                        window.clearInterval(draw_timer[index]);
                        draw_timer[index] = null;
                        document.getElementById(index).setAttribute("d", arcs[0]);
                    }
                }
                draw_timer[circle_id] = window.setInterval(function() {
                    angle -= 5;
                    if (angle >= 0) {
                        angle %= 365;
                        circle.setAttribute("d", arcs[angle]);
                        if (angle === 0) {
                            window.clearInterval(draw_timer[circle_id]);
                        }
                    }
                }, Math.round(timeout / 73));
            }
        };
        $('.js-slider-carousel:not(.owl-carousel)').each(function() {
            var $this = $(this);
            var widget_id = $this.data('widget-id');
            var autoplay = $this.data('autoplay') === 'yes';
            var animation = $this.data('animation');
            var animation_timeout = $this.data('animation-timeout');
            var dots = !$this.hasClass('h-carousel--dots-hide');
            var is_boxed = $this.hasClass('c-ip-slider__list--boxed');
            var params = {
                items: 1,
                center: false,
                autoWidth: false,
                margin: 0,
                rtl: ideapark_is_rtl,
                nav: !$(this).hasClass('h-carousel--nav-hide'),
                dots: dots,
                dotsData: true,
                loop: true,
                navText: is_boxed ? ideapark_nav_text : ideapark_nav_text_big,
                responsive: {
                    0: {
                        nav: 0
                    },
                    768: {
                        nav: !$(this).hasClass('h-carousel--nav-hide'),
                    }
                },
                onInitialized: function(event) {
                    if (autoplay && dots) {
                        var circle_id = "arc-" + widget_id + '-0';
                        drawCircle(circle_id, animation_timeout);
                    }
                    if ($(window).width() <= 767) {
                        $('.c-ip-slider__image--mobile[loading="lazy"]').removeAttr('loading');
                    } else {
                        $('.c-ip-slider__image--desktop[loading="lazy"]').removeAttr('loading');
                    }
                }
            };
            if (autoplay) {
                params.autoplay = true;
                params.autoplayTimeout = animation_timeout;
            }
            if (animation != '') {
                params.animateOut = animation + '-out';
                params.animateIn = animation + '-in';
            }
            $this.addClass('owl-carousel').on('changed.owl.carousel', function(event) {
                if (autoplay) {
                    $this.trigger('stop.owl.autoplay');
                    $this.trigger('play.owl.autoplay');
                }
                if (autoplay && dots) {
                    var page = event.page,
                        index;
                    if (event.property.name == 'position') {
                        drawCircle("arc-" + widget_id + '-' + page.index, animation_timeout);
                    }
                }
            }).owlCarousel(params);
            need_load_animation = true;
            if (is_boxed) {
                var dots_layout = function() {
                    var is_inner = $(window).width() < 1460;
                    if (is_inner && dots && !$this.hasClass('h-carousel--inner')) {
                        $this.addClass('h-carousel--inner');
                        $this.removeClass('h-carousel--round-light h-carousel--outside');
                    } else if (!is_inner && dots && !$this.hasClass('h-carousel--outside')) {
                        $this.addClass('h-carousel--round-light h-carousel--outside');
                        $this.removeClass('h-carousel--inner');
                    }
                };
                dots_layout();
                ideapark_resize_action_500_add(dots_layout);
            }
            if (ideapark_get_time() - ideapark_start_time > 4) {
                $this.trigger('next.owl.carousel');
            }
        });
    };
    root.ideapark_init_woocommerce_widget_carousel = function() {
    $('.js-woocommerce-carousel:not(.owl-carousel)').each(function() {
        var $this = $(this);
        if ($('.product', $this).length > 1) {
            var autoplay = $this.data('autoplay') === 'yes';
            var animation_timeout = $this.data('animation-timeout');
            var params = {
                center: false,
                autoWidth: false,
                loop: false,
                rtl: ideapark_is_rtl,
                nav: !$this.hasClass('h-carousel--nav-hide'),
                dots: !$this.hasClass('h-carousel--dots-hide'),
                navText: ideapark_nav_text,
                onInitialized: ideapark_owl_hide_arrows,
                responsive: {
                    0: { // Мобильные
                        items: 2,
                        margin: 10
                    },
                    576: { // Малые планшеты
                        items: 2,
                        margin: 15
                    },
                    768: { // Планшеты
                        items: 2,
                        margin: 20
                    },
                    991: { // Большие планшеты
                        items: 3,
                        margin: 25
                    },
                    992: { // Десктоп
                        items: 4,
                        margin: 30
                    }
                }
            };

            if (autoplay) {
                params.autoplay = true;
                params.autoplayTimeout = animation_timeout;
            }

            $this.addClass('owl-carousel')
                 .on('resized.owl.carousel', ideapark_owl_hide_arrows)
                 .owlCarousel(params)
                 .on('changed.owl.carousel', function() {
                     $this.find('.owl-nav,.owl-dots').removeClass('disabled');
                 });
        }
    });
};
    root.ideapark_init_team_widget_carousel = function() {
        $('.js-team-carousel:not(.owl-carousel)').each(function() {
            var $this = $(this);
            if ($('.c-ip-team__item', $this).length > 1) {
                var autoplay = $this.data('autoplay') === 'yes';
                var animation_timeout = $this.data('animation-timeout');
                var params = {
                    center: false,
                    autoWidth: true,
                    loop: $this.hasClass('h-carousel--loop'),
                    margin: 0,
                    rtl: ideapark_is_rtl,
                    nav: !$this.hasClass('h-carousel--nav-hide'),
                    dots: !$this.hasClass('h-carousel--dots-hide'),
                    navText: ideapark_nav_text,
                    onInitialized: ideapark_owl_hide_arrows
                };
                if (autoplay) {
                    params.autoplay = true;
                    params.autoplayTimeout = animation_timeout;
                }
                $this.addClass('owl-carousel').on('resized.owl.carousel', ideapark_owl_hide_arrows).owlCarousel(params).on('changed.owl.carousel', function() {
                    $this.find('.owl-nav,.owl-dots').removeClass('disabled');
                });
            }
        });
    };
    root.ideapark_init_gift_widget_carousel = function() {
        $('.js-gift-carousel:not(.owl-carousel)').each(function() {
            var $this = $(this);
            if ($('.c-ip-gift__item', $this).length > 1) {
                var autoplay = $this.data('autoplay') === 'yes';
                var animation_timeout = $this.data('animation-timeout');
                var params = {
                    center: false,
                    autoWidth: true,
                    loop: $this.hasClass('h-carousel--loop'),
                    margin: 0,
                    rtl: ideapark_is_rtl,
                    nav: !$this.hasClass('h-carousel--nav-hide'),
                    dots: !$this.hasClass('h-carousel--dots-hide'),
                    navText: ideapark_nav_text,
                    onInitialized: ideapark_owl_hide_arrows
                };
                if (autoplay) {
                    params.autoplay = true;
                    params.autoplayTimeout = animation_timeout;
                }
                $this.addClass('owl-carousel').on('resized.owl.carousel', ideapark_owl_hide_arrows).owlCarousel(params).on('changed.owl.carousel', function() {
                    $this.find('.owl-nav,.owl-dots').removeClass('disabled');
                });
            }
        });
    };
    root.ideapark_init_news_widget_carousel = function() {
        $('.js-news-carousel:not(.owl-carousel)').each(function() {
            if ($('.c-post-list', $(this)).length > 1) {
                $(this).addClass('owl-carousel').on('resized.owl.carousel', ideapark_owl_hide_arrows).on('initialized.owl.carousel', function() {
                    $(document.body).trigger('news-carousel-initialized');
                }).owlCarousel({
                    center: false,
                    autoWidth: true,
                    loop: false,
                    margin: 0,
                    rtl: ideapark_is_rtl,
                    nav: !$(this).hasClass('h-carousel--nav-hide'),
                    dots: !$(this).hasClass('h-carousel--dots-hide'),
                    navText: ideapark_nav_text,
                    onInitialized: ideapark_owl_hide_arrows,
                }).on('changed.owl.carousel', function() {
                    $(this).find('.owl-nav,.owl-dots').removeClass('disabled');
                });
            }
        });
    };
    root.ideapark_init_video_widget_carousel = function() {
        $('.js-video-carousel:not(.owl-carousel)').each(function() {
            if ($('.c-ip-video-carousel__item', $(this)).length > 1) {
                $(this).addClass('owl-carousel').on('resized.owl.carousel', ideapark_owl_hide_arrows).on('initialized.owl.carousel', function() {
                    $(document.body).trigger('video-carousel-initialized');
                }).owlCarousel({
                    center: false,
                    autoWidth: true,
                    loop: false,
                    margin: 0,
                    rtl: ideapark_is_rtl,
                    nav: !$(this).hasClass('h-carousel--nav-hide'),
                    dots: !$(this).hasClass('h-carousel--dots-hide'),
                    navText: ideapark_nav_text,
                    onInitialized: ideapark_owl_hide_arrows,
                }).on('changed.owl.carousel', function() {
                    $(this).find('.owl-nav,.owl-dots').removeClass('disabled');
                });
            }
        });
    };
    root.ideapark_init_image_list_1_carousel = function() {
        $('.js-image-list-1').each(function() {
            var $this = $(this);
            var container_width = $this.closest('.c-ip-image-list-1__wrap').outerWidth();
            var $first_item = $('.c-ip-image-list-1__item', $this).first();
            var margin = 40;
            if ($first_item.length) {
                var $owl_item = $first_item.closest('.owl-item');
                if ($owl_item.length) {
                    $first_item = $owl_item;
                }
                var element = $first_item[0];
                var style = element.currentStyle || window.getComputedStyle(element);
                if (ideapark_is_rtl) {
                    margin = parseInt(style.marginLeft.replace('px', ''));
                } else {
                    margin = parseInt(style.marginRight.replace('px', ''));
                }
            } else {
                return;
            }
            var items = 0;
            var items_width = 0;
            $this.find('.c-ip-image-list-1__item').each(function() {
                items_width += $(this).outerWidth() + margin;
                items++;
            });
            if (items_width >= container_width && items > 1) {
                if (!$this.hasClass('owl-carousel')) {
                    $this.addClass('owl-carousel').owlCarousel({
                        center: false,
                        margin: 40,
                        loop: false,
                        autoWidth: true,
                        rtl: ideapark_is_rtl,
                        nav: !$this.hasClass('h-carousel--nav-hide'),
                        dots: !$this.hasClass('h-carousel--dots-hide'),
                        navText: ideapark_nav_text,
                        responsive: {
                            0: {
                                margin: 10,
                            },
                            768: {
                                margin: 40,
                            },
                        }
                    });
                }
            } else if (items > 1) {
                if ($this.hasClass('owl-carousel')) {
                    $this.removeClass('owl-carousel').trigger("destroy.owl.carousel");
                }
            }
        });
    };
    root.ideapark_init_image_list_2_carousel = function() {
        $('.js-image-list-2').each(function() {
            var $this = $(this);
            var container_width = $this.closest('.c-ip-image-list-2__wrap').outerWidth();
            var is_carousel = $this.hasClass('owl-carousel');
            var $first_item = $('.c-ip-image-list-2__item', $this).first();
            var margin = 40;
            if ($first_item.length) {
                var $owl_item = $first_item.closest('.owl-item');
                if ($owl_item.length) {
                    $first_item = $owl_item;
                }
                var element = $first_item[0];
                var style = element.currentStyle || window.getComputedStyle(element);
                if (ideapark_is_rtl) {
                    margin = parseInt(style.marginLeft.replace('px', '')) * (is_carousel ? 1 : 2);
                } else {
                    margin = parseInt(style.marginRight.replace('px', '')) * (is_carousel ? 1 : 2);
                }
            } else {
                return;
            }
            var items = 0;
            var items_width = 0;
            $this.find('.c-ip-image-list-2__item').each(function() {
                items_width += $(this).outerWidth() + margin;
                items++;
            });
            if (items_width >= container_width && items > 1) {
                if (!$this.hasClass('owl-carousel')) {
                    var autoplay = $this.data('autoplay') === 'yes';
                    var animation_timeout = $this.data('animation-timeout');
                    var params = {
                        center: false,
                        margin: margin,
                        loop: false,
                        autoWidth: true,
                        rtl: ideapark_is_rtl,
                        nav: !$this.hasClass('h-carousel--nav-hide'),
                        dots: !$this.hasClass('h-carousel--dots-hide'),
                        navText: ideapark_nav_text,
                        onInitialized: ideapark_owl_hide_arrows,
                        responsive: {
                            0: {
                                autoWidth: false,
                                items: 1,
                            },
                            500: {
                                autoWidth: true,
                                items: 3,
                            },
                        }
                    };
                    if (autoplay) {
                        params.autoplay = true;
                        params.loop = true;
                        params.autoplayTimeout = animation_timeout;
                    }
                    $this.addClass('owl-carousel').on('resized.owl.carousel', ideapark_owl_hide_arrows).owlCarousel(params).on('changed.owl.carousel', function() {
                        ideapark_owl_hide_arrows($this);
                    });
                }
            } else if (items > 1) {
                if ($this.hasClass('owl-carousel')) {
                    $this.removeClass('owl-carousel').trigger("destroy.owl.carousel");
                }
            }
            $this.addClass('init');
        });
    };
    root.ideapark_init_reviews_widget_carousel = function() {
        $('.js-reviews-carousel:not(.owl-carousel)').each(function() {
            var $this = $(this);
            if ($this.find('.c-ip-reviews__item').length > 1) {
                var items = parseInt($this.data('items'));
                var margin = parseInt($this.data('margin'));
                $this.addClass('owl-carousel').owlCarousel({
                    center: false,
                    items: items,
                    margin: margin,
                    loop: true,
                    autoplayHoverPause: true,
                    rtl: ideapark_is_rtl,
                    autoplay: $this.hasClass('h-carousel--autoplay'),
                    nav: !$this.hasClass('h-carousel--nav-hide'),
                    dots: !$this.hasClass('h-carousel--dots-hide'),
                    navText: ideapark_nav_text,
                    responsive: {
                        0: {
                            items: 1,
                        },
                        1190: {
                            items: items,
                        },
                    }
                });
            }
        });
    };
    root.ideapark_init_countdown = function() {
        $('.js-countdown').each(function() {
            var $this = $(this),
                finalDate = $(this).data('date'),
                _n = $(this).data('month'),
                _w = $(this).data('week'),
                _d = $(this).data('day'),
                _h = $(this).data('hour'),
                _m = $(this).data('minute'),
                _s = $(this).data('second');
            if (finalDate) {
                $this.countdown(finalDate, function(event) {
                    var is_month = !($(window).width() < 375 || _n === 'no' || _n === 'false' || _n === '0');
                    var is_week = !($(window).width() < 375 || _w === 'no' || _w === 'false' || _w === '0');
                    $this.html(event.strftime('' +
                        (!is_month ? '' : ('<span class="c-ip-countdown__item"><span class="c-ip-countdown__digits">%-m</span><i class="ip-romb c-ip-countdown__separator"></i><span class="c-ip-countdown__title">' + ideapark_countdown_months + '</span></span>')) +
                        (!is_week ? '' : ('<span class="c-ip-countdown__item"><span class="c-ip-countdown__digits">%' + (is_month ? '-W' : '-w') + '</span><i class="ip-romb c-ip-countdown__separator"></i><span class="c-ip-countdown__title">' + ideapark_countdown_weeks + '</span></span>')) +
                        (_d === 'no' || _d === 'false' || _d === '0' ? '' : ('<span class="c-ip-countdown__item"><span class="c-ip-countdown__digits">%' + (is_week ? '-d' : (is_month ? '-n' : '-D')) + '</span><i class="ip-romb c-ip-countdown__separator"></i><span class="c-ip-countdown__title">' + ideapark_countdown_days + '</span></span>')) +
                        (_h === 'no' || _h === 'false' || _h === '0' ? '' : ('<span class="c-ip-countdown__item"><span class="c-ip-countdown__digits">%H</span><i class="ip-romb c-ip-countdown__separator"></i><span class="c-ip-countdown__title">' + ideapark_countdown_hours + '</span></span>')) +
                        (_m === 'no' || _m === 'false' || _m === '0' ? '' : ('<span class="c-ip-countdown__item"><span class="c-ip-countdown__digits">%M</span><i class="ip-romb c-ip-countdown__separator"></i><span class="c-ip-countdown__title">' + ideapark_countdown_minutes + '</span></span>')) +
                        (_s === 'no' || _s === 'false' || _s === '0' ? '' : ('<span class="c-ip-countdown__item"><span class="c-ip-countdown__digits">%S</span><i class="ip-romb c-ip-countdown__separator"></i><span class="c-ip-countdown__title">' + ideapark_countdown_seconds + '</span></span>'))));
                });
            }
        });
    };
    root.ideapark_init_accordion = function() {
        $('.js-accordion-title').on('click', function() {
            var $this = $(this);
            var $accordion = $this.closest('.c-ip-accordion');
            var $item = $this.closest('.c-ip-accordion__item');
            var $content = $item.find('.c-ip-accordion__content');
            var $old_item = $accordion.find('.c-ip-accordion__item--active');
            var is_active = $item.hasClass('c-ip-accordion__item--active');
            if ($old_item.length) {
                $old_item.removeClass('c-ip-accordion__item--active');
                $old_item.find('.c-ip-accordion__content').slideUp();
            }
            if (!is_active) {
                $content.slideDown();
                $item.addClass('c-ip-accordion__item--active');
            }
        });
    };
    root.ideapark_init_tabs = function(is_resize) {
        $('.js-ip-tabs-list').each(function() {
            var $this = $(this);
            var $tabs = $this.closest('.js-ip-tabs');
            var container_width = $this.closest('.js-ip-tabs-wrap').outerWidth();
            var $first_tab = $('.js-ip-tabs-menu-item', $tabs).first();
            var margin = 46;
            if ($first_tab.length) {
                var $owl_item = $first_tab.closest('.owl-item');
                if ($owl_item.length) {
                    $first_tab = $owl_item;
                }
                var element = $first_tab[0];
                var style = element.currentStyle || window.getComputedStyle(element);
                if (ideapark_is_rtl) {
                    margin = parseInt(style.marginLeft.replace('px', ''));
                } else {
                    margin = parseInt(style.marginRight.replace('px', ''));
                }
            } else {
                return;
            }
            var items_width = -margin;
            $this.find('.js-ip-tabs-menu-item').each(function() {
                items_width += $(this).outerWidth() + margin;
            });
            if (items_width >= container_width) {
                if (!$this.hasClass('owl-carousel')) {
                    $this.addClass('owl-carousel').owlCarousel({
                        center: false,
                        loop: false,
                        margin: margin,
                        autoWidth: true,
                        rtl: ideapark_is_rtl,
                        nav: !$this.hasClass('h-carousel--nav-hide'),
                        dots: !$this.hasClass('h-carousel--dots-hide'),
                        navText: ideapark_nav_text
                    });
                }
            } else {
                if ($this.hasClass('owl-carousel')) {
                    $this.removeClass('owl-carousel').trigger("destroy.owl.carousel");
                }
            }
            if (typeof is_resize === 'undefined' || !is_resize) {
                if (!$this.hasClass('init')) {
                    $('.js-ip-tabs-link', $tabs).on('click', function(e) {
                        e.preventDefault();
                        var $this = $(this);
                        var index = $this.data('index');
                        var $content = $tabs.find($this.attr('href'));
                        var $tab = $this.closest('.js-ip-tabs-menu-item');
                        var $current_content = $tabs.find('.visible');
                        $tabs.find('.js-ip-tabs-menu-item.active').removeClass('active');
                        $tab.addClass('active');
                        if ($content.length && $current_content.length) {
                            var f = function() {
                                f = null;
                                $current_content.removeClass('visible');
                                $content.addClass('visible');
                                setTimeout(function() {
                                    $content.addClass('active');
                                }, 10);
                                setTimeout(function() {
                                    $content.find('.owl-carousel').each(function() {
                                        $(this).trigger('refresh.owl.carousel');
                                        ideapark_owl_hide_arrows($(this));
                                    });
                                }, 350);
                            };
                            var f2 = function() {
                                if (f) {
                                    f();
                                }
                            };
                            ideapark_on_transition_end_callback($current_content, f2);
                            setTimeout(f2, 400);
                            $current_content.removeClass('active');
                        }
                        $this.closest('.js-ip-tabs-list').trigger("to.owl.carousel", [index, 300]);
                    });
                    $this.addClass('init');
                }
            }
        });
    };
    root.ideapark_init_banners = function() {
        $('.js-ip-banners:not(.init)').each(function() {
            var $list = $(this);
            var $items = $('.c-ip-banners__item', $list);
            var animation = $list.data('animation');
            var animation_timeout = $list.data('animation-timeout');
            var i = 1;
            var $banners = [];
            var timer = null;
            var is_images_loaded = false;
            var is_started = false;
            $list.addClass('init');
            if ($items.length) {
                var observer = new IntersectionObserver(function(entries) {
                    if (entries[0].isIntersecting === true) {
                        if (!is_images_loaded) {
                            $list.find('.c-ip-banners__image[loading]').removeAttr('loading');
                            is_images_loaded = true;
                        }
                        is_started = true;
                    } else {
                        is_started = false;
                    }
                }, {
                    threshold: [0]
                });
                observer.observe($list[0]);
                $items.each(function() {
                    var $banner = $(this);
                    var order = i++;
                    var timestamp = Math.round(new Date() / 1000);
                    $banner.css({
                        order: order
                    });
                    $banner.data('timestamp', timestamp - (i === 2 ? -1 : 0));
                    $banners.push($banner);
                });
                timer = setInterval(function() {
                    if (!is_started) {
                        return;
                    }
                    var $first_item = $items.first();
                    var element = $first_item[0];
                    var style = element.currentStyle || window.getComputedStyle(element);
                    var banner_width = parseInt(style.width.replace('px', ''));
                    var window_width = $(window).width();
                    var banners_on_screen = Math.round(window_width / banner_width);
                    var $banners_visible = [];
                    var $banners_order = [];
                    $banners.sort(function($a, $b) {
                        return $a.css('order') - $b.css('order');
                    });
                    for (var i = 0; i < $banners.length; i++) {
                        if (i < banners_on_screen) {
                            $banners_visible.push($banners[i]);
                        } else {
                            $banners_order.push($banners[i]);
                        }
                    }
                    if ($banners_order.length) {
                        $banners_visible.sort(function($a, $b) {
                            return $a.data('timestamp') - $b.data('timestamp');
                        });
                        $banners_order.sort(function($a, $b) {
                            return $a.data('timestamp') - $b.data('timestamp');
                        });
                        var timestamp = Math.round(new Date() / 1000);
                        var $old_banner = $banners_visible[0];
                        if (typeof $old_banner === 'undefined') {
                            clearInterval(timer);
                            return;
                        }
                        var old_order = $old_banner.css('order');
                        var $new_banner = $banners_order[0];
                        var new_order = $new_banner.css('order');
                        $list.css({
                            'height': $old_banner.outerHeight() + 'px'
                        });
                        $new_banner.addClass('c-ip-banners__item--animation');
                        ideapark_on_animation_end_callback($new_banner, function() {
                            $new_banner.css({
                                order: old_order
                            }).data('timestamp', timestamp);
                            $old_banner.css({
                                order: new_order
                            }).data('timestamp', timestamp);
                            $old_banner.removeClass(animation + '-out');
                            $new_banner.removeClass(animation + '-in').removeClass('c-ip-banners__item--animation').css({
                                'left': '',
                                'height': ''
                            });
                            $list.css({
                                'height': ''
                            });
                        });
                        $new_banner.addClass(animation + '-in').css({
                            'left': $old_banner.offset().left - $list.offset().left + 'px',
                            'height': $old_banner.outerHeight() + 'px'
                        });
                        $old_banner.addClass(animation + '-out');
                    }
                }, animation_timeout);
            }
        });
    };
})(jQuery, window);

document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordInput = document.querySelector('input[name="password1"]');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-lock');
    this.classList.toggle('fa-unlock');
});

