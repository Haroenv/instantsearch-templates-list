import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Fetch } from 'react-request';
import './styles.css';

console.log('test out now.sh');

const url =
  'https://api.github.com/repos/algolia/create-instantsearch-app/contents?ref=templates';

const Error = ({ failed, error, data }) =>
  failed ? (
    <div className="error">
      Error:{' '}
      <code>
        {error ? error.message : data ? data.message : 'unknown'}
      </code>
    </div>
  ) : null;

const images = {
  'angular-instantsearch': 'angular-instantsearch.svg',
  'autocomplete.js': undefined,
  'instantsearch-android': 'instantsearch-android.svg',
  'instantsearch-ios': 'instantsearch-ios.svg',
  'instantsearch.js': 'instantsearch.js.svg',
  'javascript-client': undefined,
  'javascript-helper': undefined,
  'react-instantsearch-native': 'react-instantsearch.svg',
  'react-instantsearch': 'react-instantsearch.svg',
  'vue-instantsearch': 'vue-instantsearch.svg',
  fallback: 'algolia.svg',
};
const Sandbox = ({ name, url, id, native, repo }) => (
  <div className={`sandbox ${native ? 'native' : ''}`}>
    <a href={native ? repo : url} target="_blank">
      {name}
      <img src={images[id] || images.fallback} alt="logo" />
    </a>
  </div>
);

const nativeLibraries = [
  'instantsearch-android',
  'instantsearch-ios',
  'react-instantsearch-native',
];

const dataToSandboxes = data =>
  data
    .filter(({ type }) => type === 'dir')
    .map(({ html_url, name }) => ({
      id: name,
      name: name
        .replace(/-/g, ' ')
        .replace('instantsearch', 'InstantSearch')
        .replace('javascript', 'JavaScript')
        .split(' ')
        .map(s => s.slice(0, 1).toLocaleUpperCase() + s.slice(1))
        .join(' ')
        .replace('Ios', 'iOS'),
      url: html_url.replace('github.com', 'codesandbox.io/s/github'),
      native: nativeLibraries.includes(name),
      repo: html_url,
    }));

const Listing = ({ data }) => (
  <ul className="listing">
    {dataToSandboxes(data).map(({ name, url, id, native, repo }) => (
      <li key={name} className="listing-item">
        <Sandbox
          name={name}
          url={url}
          id={id}
          native={native}
          repo={repo}
        />
      </li>
    ))}
  </ul>
);

const App = () => (
  <Fragment>
    <header className="header">
      <h1 className="header-title">
        <a href="/">Create InstantSearch App</a>
      </h1>
      <p className="header-subtitle">templates</p>
    </header>
    <main>
      <p>
        All the Create InstantSearch App templates available on
        CodeSandbox here:
      </p>
      <Fetch url={url}>
        {({ data, error, failed }) =>
          !failed && data ? (
            <Listing data={data} />
          ) : (
            <Error error={error} data={data} failed={failed} />
          )
        }
      </Fetch>
    </main>
  </Fragment>
);

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
