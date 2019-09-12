import { useRef } from 'react'

const maxAcceptInterval = 120 // ms
const maxAcceptMoveThreshold = 6 // px
export enum EventType {
    touchStart = 1,
    touchEnd = 2,
    touchCancel = 3,
    touchMove = 4,
}

const detectSingleFingerTouch = (eventType, event) => {
    if (eventType === EventType.touchStart) {
        // touches.length === changedTouches.length && changedTouches.length === 1
        const isSingle =event.touches && event.touches.length === 1
            && event.changedTouches && event.changedTouches.length === 1
        return [isSingle, event.touches[0]]
    }

    if (eventType === EventType.touchMove) {
        // changedTouches.length === 1
        const isSingle = event.touches && event.touches.length === 1
        return [isSingle, event.touches[0]]
    }

    if (eventType === EventType.touchEnd) {
        // touches.length === 0 && changedTouches.length === 1
        const isSingle = event.touches && event.touches.length === 0
            && event.changedTouches && event.changedTouches.length === 1
        return [isSingle, event.changedTouches[0]]
    }

    return [false]
}

const isClickLike = (touchPoints) => {
    if (touchPoints.length <= 1) {
        throw new Error('simulate click source code error')
    }

    const startPoint = touchPoints[0]
    const isOutTime = touchPoints[touchPoints.length - 1]._ts - startPoint._ts > maxAcceptInterval
    const isOutSpace = touchPoints.filter((item) => {
        const distance = Math.abs(item.clientX - startPoint.clientX)
            + Math.abs(item.clientY - startPoint.clientY)
        return distance > maxAcceptMoveThreshold
    }).length > 0

    return !isOutTime && !isOutSpace
}

const useSimulateClick = (onSimulateClick = (e) => {}) => {
    const touchPointsRef = useRef([])

    const addTouchPoint = (type, point) => {
        // _ts: avoid conflicts with existing attributes
        const notKeepMoveTouchPointUntilNumMoreThan = 9
        const newPoint = { clientX: point.clientX, clientY: point.clientY,  _ts: new Date().getTime() }
        if (type === EventType.touchStart) {
            touchPointsRef.current = [newPoint]
        } else {
            // append point for touch move and touch end
            if (type === EventType.touchMove && touchPointsRef.current.length > notKeepMoveTouchPointUntilNumMoreThan) {
                // don't keep more touch move points
            } else {
                touchPointsRef.current = [...touchPointsRef.current, newPoint]
            }
        }
    }

    const clearTouchPoints = () => {
        touchPointsRef.current = []
    }



    return (type) => (e) => {
        const [isSingleFinger, touchPoint] = detectSingleFingerTouch(type, e)
        if (isSingleFinger) {
            // start -> move -> end must single finger always
            // collect points
            addTouchPoint(type, touchPoint)

            // judge
            if (type === EventType.touchEnd && isClickLike(touchPointsRef.current)) {
                onSimulateClick(e)
            }
        } else {
            clearTouchPoints()
        }
    }
}

export default useSimulateClick
