/*global defineSuite*/
defineSuite([
         'DynamicScene/DynamicClock',
         'DynamicScene/DynamicObject',
         'Core/JulianDate',
         'Core/TimeInterval',
         'Core/ClockRange',
         'Core/ClockStep'
     ], function(
         DynamicClock,
         DynamicObject,
         JulianDate,
         TimeInterval,
         ClockRange,
         ClockStep) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('merge assigns unassigned properties', function() {
        var source = new DynamicClock();
        source.startTime = new JulianDate();
        source.stopTime = new JulianDate();
        source.currentTime = new JulianDate();
        source.clockRange = ClockRange.CLAMPED;
        source.clockStep = ClockStep.TICK_DEPENDENT;
        source.multiplier = 1;

        var target = new DynamicClock();
        target.merge(source);

        expect(target.startTime).toBe(source.startTime);
        expect(target.stopTime).toBe(source.stopTime);
        expect(target.currentTime).toBe(source.currentTime);
        expect(target.clockRange).toBe(source.clockRange);
        expect(target.clockStep).toBe(source.clockStep);
        expect(target.multiplier).toBe(source.multiplier);
    });

    it('merge does not assign assigned properties', function() {
        var source = new DynamicClock();
        source.startTime = new JulianDate();
        source.stopTime = new JulianDate();
        source.currentTime = new JulianDate();
        source.clockRange = ClockRange.CLAMPED;
        source.clockStep = ClockStep.TICK_DEPENDENT;
        source.multiplier = 1;

        var startTime = new JulianDate();
        var stopTime = new JulianDate();
        var currentTime = new JulianDate();
        var clockRange = ClockRange.CLAMPED;
        var clockStep = ClockStep.TICK_DEPENDENT;
        var multiplier = 1;

        var target = new DynamicClock();
        target.startTime = startTime;
        target.stopTime = stopTime;
        target.currentTime = currentTime;
        target.clockRange = clockRange;
        target.clockStep = clockStep;
        target.multiplier = multiplier;

        target.merge(source);

        expect(target.startTime).toBe(startTime);
        expect(target.stopTime).toBe(stopTime);
        expect(target.currentTime).toBe(currentTime);
        expect(target.clockRange).toBe(clockRange);
        expect(target.clockStep).toBe(clockStep);
        expect(target.multiplier).toBe(multiplier);
    });

    it('clone works', function() {
        var source = new DynamicClock();
        source.startTime = new JulianDate();
        source.stopTime = new JulianDate();
        source.currentTime = new JulianDate();
        source.clockRange = ClockRange.CLAMPED;
        source.clockStep = ClockStep.TICK_DEPENDENT;
        source.multiplier = 1;

        var result = source.clone();
        expect(result.startTime).toBe(source.startTime);
        expect(result.stopTime).toBe(source.stopTime);
        expect(result.currentTime).toBe(source.currentTime);
        expect(result.clockRange).toBe(source.clockRange);
        expect(result.clockStep).toBe(source.clockStep);
        expect(result.multiplier).toBe(source.multiplier);
    });

    it('merge throws if source undefined', function() {
        var target = new DynamicClock();
        expect(function() {
            target.merge(undefined);
        }).toThrowDeveloperError();
    });
});