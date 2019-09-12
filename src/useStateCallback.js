import { useState, useRef, useEffect } from 'react'

const NOOP = () => {}
const useStateWithCallback = (initState) => {
    const [state, setState] = useState(initState)
    const callbackRef = useRef([])

    useEffect(() => {
        while (true) {
            const cb = callbackRef.current.shift()
            if (!cb) {
                break
            }

            cb()
        }
    }, [state])

    return [state, (s, callback = NOOP) => {
        if (typeof callback !== 'function') {
            throw new Error('The second argument must be a function')
        }
        // 避免react bat setState
        callbackRef.current.push(callback)
        setState(s)
    }]
}

export default useStateWithCallback
