/* global describe, it, expect */

import isAppFetching, { toggleAppFetching, TOGGLE_IS_APP_FETCHING, getFetching } from '../is-app-fetching'

describe('app fetching action', () => {
  it('should create an action to toggle fetching', () => {
    const expectedAction = {
      type: TOGGLE_IS_APP_FETCHING,
      payload: null,
      error: false
    }
    expect(toggleAppFetching()).toEqual(expectedAction)
  })
  it('should create an action to toggle fetching with an error if one is sent', () => {
    const err = new Error('something bad happened')
    const expectedAction = {
      type: TOGGLE_IS_APP_FETCHING,
      payload: err,
      error: true
    }
    expect(toggleAppFetching(err)).toEqual(expectedAction)
  })
})

describe('app fetching reducer', () => {
  it('will return default state if no action type matches', () => {
    expect(isAppFetching(undefined, {})).toEqual({
      isAppFetching: false,
      payload: null,
      error: false
    })
  })
  it('should handle toggling', () => {
    expect(isAppFetching(undefined, {
      type: TOGGLE_IS_APP_FETCHING
    })).toEqual({
      isAppFetching: true,
      payload: null,
      error: false
    })
  })
})

describe('select fetching', () => {
  let state = {
    isAppFetching: {
      isAppFetching: false,
      payload: null,
      error: false
    }
  }
  it('will get the value of fetching from the state', () => {
    expect(getFetching(state)).toEqual({
      isAppFetching: false,
      payload: null,
      error: false
    })
  })
  it('will get the the other value when state changes', () => {
    // simulate what combine reducers does
    state = {
      isAppFetching: isAppFetching(undefined, {
        type: TOGGLE_IS_APP_FETCHING
      })
    }
    expect(getFetching(state)).toEqual({
      isAppFetching: true,
      payload: null,
      error: false
    })
    expect(getFetching.recomputations()).toEqual(2)
  })
})
