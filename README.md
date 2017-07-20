react-redux-transition-manager
=====================
Higher order component to enable loading states between route transitions and fetch data for the new route

[![peerDependencies Status](https://david-dm.org/kellyrmilligan/react-redux-transition-manager/peer-status.svg)](https://david-dm.org/kellyrmilligan/react-redux-transition-manager?type=peer)
[![Build Status](https://travis-ci.org/kellyrmilligan/react-redux-transition-manager.svg?branch=master)](https://travis-ci.org/kellyrmilligan/react-redux-transition-manager)
[![Coverage Status](https://coveralls.io/repos/github/kellyrmilligan/react-redux-transition-manager/badge.svg?branch=master)](https://coveralls.io/github/kellyrmilligan/react-redux-transition-manager?branch=master)

![transiton-manager-example](https://cloud.githubusercontent.com/assets/2642088/20978729/9466bed2-bc6f-11e6-838a-a13d0b6a6509.gif)

## Why?
There is a lot of boilerplate involved when using react router and fetching the necessary data when transitioning from route to route. This is an attempt to simplify this process with 2 primary features:

- fetch the data that is needed for a new route before rendering the route
- display a loading indicator in the app signifying that the new route is loading, while keeping the current route visible

inspired by https://github.com/ReactTraining/react-router/issues/2101


## Import reducer into app
import the reducer to add it to the redux store. this will allow you to connect other components the fetching state of the app and allow the transition manager component to dispatch and get the information from the store during transitions

```js
import { combineReducers } from 'redux'
import isAppFetching from 'react-redux-transition-manager/redux/is-app-fetching'

const app = combineReducers({
  isAppFetching,
  //other reducers
})

export default app
```

## Wrap your App in the transition manager component

in your top level component, wrap it's contents with transition manger like so...

```js
import TransitionManager from 'react-redux-transition-manager'

const ErrorPage = (props) => (
  <div className="Error">Ooops! there was an error...</div>
)

const LoadingIndicator = (props) => (
  <div className="Loader">loading...</div>
)

const App = (props) =>
  <TransitionManager {...props}
    onFetchStart={() => console.log('started fetching data for routes')}
    onFetchEnd={() => console.log('finished fetching data for routes')}
    onError={(err) => console.log('an error happened while fetching data for routes ', err)}
    FetchingIndicator={<LoadingIndicator />}
    ErrorIndicator={<ErrorPage />}
  >
    <Header />
    <div className="App">
      {props.children}
    </div>
  </TransitionManager>
```

this will do a few things. when the route starts to change, it will do the following:

- call `onFetchStart`
- render `FetchingIndicator` into the body of the page so you can style it above your app more easily and add a class to the `body`, `TransitionManager-body-is-fetching`
- loop through the matched handlers looking for fetch methods.
- call the fetch methods, collecting any promises.
- wait for the promises to resolve before rendering the new route if promises are found. if none are found, it will resolve immediately.
- on successful fetching, it will call `onFetchEnd`
- on an error, it will call `onError` and render the `ErrorIndicator` component


you can connect other components to the store to see if it is fetching as well:

```js
import { getFetching } from 'react-redux-transition-manager/redux/is-app-fetching'

//your component code...etc.
const mapStateToProps = (state, ownProps) => {
  return {
    isAppFetching: getFetching(state)
  }
}
```

## Specifying route data needs
This allows you to specify at the route handler level what data that route needs via a static fetch method. The fetching itself should be wired up to redux via thunks, or whatever way you want to handle that. the only requirement is that the static method returns a promise.

```js
import React, { Component } from 'react'
import { connect } from 'react-redux'
import fetchStuff from 'data/stuff/fetchStuff' //your async action

class Page extends Component {

  static fetch(params, query, { dispatch, getState }) {
    return dispatch(fetchAddresses())
  }

  render() {
    return (
      <p>{this.props.stuff}</p>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    stuff: state.stuff  
  }
}

export default connect(
  mapStateToProps
)(Page)
```

### Static method params
The [reactRouterFetch](https://github.com/kellyrmilligan/react-router-fetch) module is used to call the static methods on the matched route handlers. it will call the fetch method with the react router params(path params), the query(`?id=whatever`), and the redux `dispatch` and `getState` methods.

## Props
`onFetchStart: PropTypes.func` - This is a function that will be called when fetching starts.

`onFetchEnd: PropTypes.func` - This is called when fetching ends

`onError: PropTypes.func` - This is called when an error occurs during transition, like a request fails

`FetchingIndicator: PropTypes.element` - This will be rendered outside the react component tree into the body, so you can use css to put it above the application.

`ErrorIndicator: PropTypes.element` - This will be rendered instead of `props.children` when an error occurs.

`SplashScreen: PropTypes.element` - This is the element to be shown for the initial page load. your loading indicator may be enough, so this is optional

`fetchInitial: PropTypes.bool` - This is for using this in client side apps only, this will initiate a fetch of the route right away, since the data wasn't loaded from the server.

`showIndicatorOnInitial` - This prop will control whether or not you want to also show your loading indicator on the initial load. Depending on your ui, you may want to have a splash screen with a loading bar at the top of the page or something.

## Still to do:
- add more tests for the actual component. sorry the coverage badge is so bad, i'm still learning enzyme. all the reducers are 100% covered
- if your API returns an error that you want to handle more specifically, you need to do it in your error Indicator and access your redux store. While this is serviceable, I want to provided a `pass-through`, where if an error happens on a certain route, you will be able to handle the error in the route handler instead if you want to.
