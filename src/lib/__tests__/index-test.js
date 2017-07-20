/* global describe, it, expect */
import React from 'react'
import { shallow } from 'enzyme'
import TransitionManager from '../index'
import isAppFetching from '../../redux/is-app-fetching'
import { Provider } from 'react-redux'
import { combineReducers, createStore } from 'redux'

const rootReducer = combineReducers({
  isAppFetching
})

function configureStore () {
  return createStore(rootReducer)
}

describe('react-route-transition-manager', () => {
  it('be able to be rendered', () => {
    const wrapper = shallow(
      <Provider store={configureStore()}>
        <TransitionManager>
          <div className='app' />
        </TransitionManager>
      </Provider>
    )
    expect(wrapper.find('.app').length).toBe(1)
  })
  it('will render children by default', () => {
    const wrapper = shallow(
      <Provider store={configureStore()}>
        <TransitionManager>
          <div className='app' />
        </TransitionManager>
      </Provider>
    )
    expect(wrapper.find('.app').length).toBe(1)
  })
})
