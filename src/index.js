import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Fetch } from 'react-request';
import './styles.css';

const templatesRoot =
  'https://api.github.com/repos/algolia/create-instantsearch-app/contents?ref=templates';
const codeSamplesRoot =
  'https://api.github.com/repos/algolia/doc-code-samples/git/trees/master';

const getExamplesUrl = repo =>
  `https://api.github.com/repos/algolia/${repo}/contents/examples`;

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
  'React InstantSearch Native',
];

const titleCase = str =>
  str
    .split('-')
    .map(s => s.slice(0, 1).toLocaleUpperCase() + s.slice(1))
    .join(' ');

const kebabCase = str => str.replace(/ /g, '-').toLocaleLowerCase();

const dataToSandboxes = data =>
  data
    .filter(({ type }) => type === 'dir')
    .map(({ html_url, name }) => ({
      id: name.replace(/-\d\.x/, ''),
      name: titleCase(name)
        .replace(/InstantSearch/i, 'InstantSearch')
        .replace(/JavaScript/i, 'JavaScript')
        .replace(/iOS/i, 'iOS'),
      url: html_url.replace('github.com', 'codesandbox.io/s/github'),
      native: nativeLibraries.includes(name),
      instantsearch: name.includes('instantsearch'),
      repo: html_url,
    }))
    .sort((a, b) =>
      a.native === b.native
        ? b.instantsearch - a.instantsearch
        : a.native - b.native
    );

const childToSandboxes = (data, parent) =>
  data.tree
    .filter(({ type }) => type === 'tree')
    .map(({ path, url }) => {
      const repository = new URL(url).pathname.split('/').slice(2, 4);

      const pathname = [
        ...repository,
        'tree',
        'master',
        parent.path,
        path,
      ];

      const sandbox = new URL('https://codesandbox.io');
      sandbox.pathname = ['s', 'github', ...pathname].join('/');

      const github = new URL('https://github.com');
      github.pathname = pathname.join('/');

      return {
        id: kebabCase(parent.path),
        name: titleCase(path),
        url: sandbox,
        native: nativeLibraries.includes(parent.path),
        instantsearch: parent.path.includes('instantsearch'),
        repo: github,
      };
    });

const Listing = ({ data }) => (
  <ul className="listing">
    {data.map(({ name, url, id, native, repo }) => (
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
      <section>
        <h2>
          All the Create InstantSearch App templates available on
          CodeSandbox here:
        </h2>
        <Fetch url={templatesRoot}>
          {({ data, error, failed }) =>
            !failed && data ? (
              <Listing data={dataToSandboxes(data)} />
            ) : (
              <Error error={error} data={data} failed={failed} />
            )
          }
        </Fetch>
      </section>
      <section>
        <h2>
          All the documentation code samples available on CodeSandbox
          here:
        </h2>
        <Fetch url={codeSamplesRoot}>
          {({ data, error, failed }) =>
            !failed && data && data.tree ? (
              data.tree
                .filter(
                  node =>
                    node.type === 'tree' && node.path !== '.circleci'
                )
                .map(node => (
                  <section key={node.sha}>
                    <h3>{node.path}</h3>
                    <Fetch url={node.url}>
                      {({ data, error, failed }) =>
                        !failed && data && data.tree ? (
                          <Listing
                            data={childToSandboxes(data, node)}
                          />
                        ) : (
                          <Error
                            error={error}
                            data={data}
                            failed={failed}
                          />
                        )
                      }
                    </Fetch>
                  </section>
                ))
            ) : (
              <Error error={error} data={data} failed={failed} />
            )
          }
        </Fetch>
      </section>
      <section>
        <h2>Examples from within the repos:</h2>
        <section>
          <h3>InstantSearch.js</h3>
          <Fetch url={getExamplesUrl('instantsearch.js')}>
            {({ data, error, failed }) =>
              !failed && data ? (
                <Listing
                  data={data.map(({ name, html_url }) => ({
                    name: name,
                    url: html_url.replace(
                      'github.com',
                      'codesandbox.io/s/github'
                    ),
                    id: 'instantsearch.js',
                    native: false,
                    repo: html_url,
                  }))}
                />
              ) : (
                <Error error={error} data={data} failed={failed} />
              )
            }
          </Fetch>
        </section>
        <section>
          <h3>Angular InstantSearch</h3>
          <Fetch url={getExamplesUrl('angular-instantsearch')}>
            {({ data, error, failed }) =>
              !failed && data ? (
                <Listing
                  data={data.map(({ name, html_url }) => ({
                    name: name,
                    url: html_url.replace(
                      'github.com',
                      'codesandbox.io/s/github'
                    ),
                    id: 'angular-instantsearch',
                    native: false,
                    repo: html_url,
                  }))}
                />
              ) : (
                <Error error={error} data={data} failed={failed} />
              )
            }
          </Fetch>
        </section>
        <section>
          <h3>React InstantSearch</h3>
          <Fetch url={getExamplesUrl('react-instantsearch')}>
            {({ data, error, failed }) =>
              !failed && data ? (
                <Listing
                  data={data.map(({ name, html_url }) => ({
                    name: name,
                    url: html_url.replace(
                      'github.com',
                      'codesandbox.io/s/github'
                    ),
                    id: 'react-instantsearch',
                    native: false,
                    repo: html_url,
                  }))}
                />
              ) : (
                <Error error={error} data={data} failed={failed} />
              )
            }
          </Fetch>
        </section>
        <section>
          <h3>Vue InstantSearch</h3>
          <Fetch url={getExamplesUrl('vue-instantsearch')}>
            {({ data, error, failed }) =>
              !failed && data ? (
                <Listing
                  data={data
                    .filter(({ type }) => type === 'dir')
                    .map(({ name, html_url }) => ({
                      name: name,
                      url: html_url.replace(
                        'github.com',
                        'codesandbox.io/s/github'
                      ),
                      id: 'vue-instantsearch',
                      native: false,
                      repo: html_url,
                    }))}
                />
              ) : (
                <Error error={error} data={data} failed={failed} />
              )
            }
          </Fetch>
        </section>
      </section>
    </main>
  </Fragment>
);

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
