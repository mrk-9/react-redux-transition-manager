import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import reactRouterFetch from 'react-router-fetch'
import { toggleAppFetching, getFetching } from '../redux/is-app-fetching'
import ReactDOM, { unstable_renderSubtreeIntoContainer as renderSubtreeIntoContainer } from 'react-dom'

const FetchingIndicatorWrapper = ({ Indicator, shouldShow, ...rest }) => (
  <div>
    {shouldShow && React.cloneElement(Indicator, { shouldShow, ...rest })}
  </div>
)

const TransitionManager = class TransitionManager extends Component {

  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  static propTypes = {
    onFetchStart: PropTypes.func,
    onFetchEnd: PropTypes.func,
    onError: PropTypes.func,
    fetchInitial: PropTypes.bool,
    showIndicatorOnInitial: PropTypes.bool,
    FetchingIndicator: PropTypes.element,
    ErrorIndicator: PropTypes.element,
    SplashScreen: PropTypes.element
  }

  state = {
    isAppFetching: false
  }

  componentWillMount () {
    const { fetchInitial } = this.props
    if (fetchInitial) this.fetchRoutes(this.props)
  }

  componentDidMount () {
    const { fetchInitial, showIndicatorOnInitial } = this.props
    this.node = document.createElement('div')
    document.body.appendChild(this.node)
    if (this.state.isAppFetching && fetchInitial && showIndicatorOnInitial) this.renderLoading(true)
  }

  componentWillReceiveProps (nextProps) {
    const current = `${this.props.location.pathname}${this.props.location.search}`
    const next = `${nextProps.location.pathname}${nextProps.location.search}`
    const { isAppFetching, onError } = nextProps
    if (isAppFetching.error && onError) onError(isAppFetching.payload)
    if (current === next) {
      return
    }
    this.fetchRoutes(nextProps)
    this.renderLoading(true)
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !nextState.isAppFetching
  }

  componentWillUnmount () {
    if (this.node) {
      ReactDOM.unmountComponentAtNode(this.node)
      document.body.removeChild(this.node)
    }
    this.portal = null
    this.node = null
  }

  renderLoading (shoudShow) {
    const { FetchingIndicator } = this.props
    if (shoudShow) {
      document.body.classList.add('TransitionManager-body-is-fetching')
      if (FetchingIndicator) this.portal = renderSubtreeIntoContainer(this, <FetchingIndicatorWrapper Indicator={FetchingIndicator} shouldShow={shoudShow} {...this.props} />, this.node)
    } else {
      document.body.classList.remove('TransitionManager-body-is-fetching')
      if (FetchingIndicator) this.portal = renderSubtreeIntoContainer(this, <FetchingIndicatorWrapper Indicator={FetchingIndicator} shouldShow={shoudShow} {...this.props} />, this.node)
    }
  }

  fetchRoutes (nextProps) {
    const { dispatch, onFetchStart, onFetchEnd } = this.props
    if (onFetchStart) onFetchStart()
    dispatch(toggleAppFetching())
    this.setState({
      isAppFetching: !this.state.isAppFetching
    }, () => {
      reactRouterFetch({
        components: nextProps.routes.map((route) => route.component),
        params: nextProps.params,
        location: nextProps.location
      }, false, {
        dispatch,
        getState: this.context.store.getState
      })
        .then(() => {
          this.setState({
            isAppFetching: !this.state.isAppFetching
          }, () => {
            this.renderLoading(false)
            if (onFetchEnd) onFetchEnd()
            dispatch(toggleAppFetching())
          })
        },
        (err) => {
          this.setState({
            isAppFetching: !this.state.isAppFetching
          }, () => {
            this.renderLoading(false)
            if (onFetchEnd) onFetchEnd(err)
            dispatch(toggleAppFetching(err))
          })
        })
    })
  }

  render () {
    const { ErrorIndicator, isAppFetching, SplashScreen, fetchInitial } = this.props
    if (isAppFetching.error) {
      return (
        <div>
          {React.cloneElement(ErrorIndicator, {...this.props})}
        </div>
      )
    }
    if (fetchInitial && isAppFetching && SplashScreen) {
      return (
        <div>
          {SplashScreen}
        </div>
      )
    }
    return (
      <div>
        {this.props.children}
      </div>
    )
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    isAppFetching: getFetching(state),
    location: ownProps.location,
    params: ownProps.params,
    routes: ownProps.routes
  }
}

export default connect(
  mapStateToProps
)(TransitionManager)
