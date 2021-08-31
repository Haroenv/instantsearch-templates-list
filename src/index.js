import React, { Fragment, useState } from 'react';
import ReactDOM from 'react-dom';
import { Fetch as OriginalFetch } from 'react-request';
import netlify from 'netlify-auth-providers';
import './styles.css';

const templatesRoot =
  'https://api.github.com/repos/algolia/create-instantsearch-app/contents?ref=templates';
const codeSamplesRoot =
  'https://api.github.com/repos/algolia/doc-code-samples/git/trees/master';

const getExamplesUrl = (repo) =>
  `https://api.github.com/repos/algolia/${repo}/contents/examples`;

const Fetch = ({ token, url, ...props }) => {
  return (
    <OriginalFetch
      headers={
        token ? { Authorization: `token ${token}` } : undefined
      }
      // react-request has a dumb cache that doesn't take headers in account!
      url={url + (token ? (url.includes('?') ? '&' : '?') : '')}
      {...props}
    />
  );
};

function authWithGitHub() {
  return new Promise((resolve, reject) => {
    var authenticator = new netlify({
      site_id: '4c56efd1-3c5f-4e55-a88d-e63d3197807f',
    });
    authenticator.authenticate(
      { provider: 'github' },
      function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
}

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

const titleCase = (str) =>
  str
    .split('-')
    .map((s) => s.slice(0, 1).toLocaleUpperCase() + s.slice(1))
    .join(' ');

const kebabCase = (str) => str.replace(/ /g, '-').toLocaleLowerCase();

const dataToSandboxes = (data) =>
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

const Auth = ({ onAuth = () => {} }) => {
  const [status, setStatus] = useState('');
  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={() => {
          authWithGitHub()
            .then(({ token }) => {
              setStatus('✓');
              onAuth(token);
              localStorage.setItem('github-token', token);
            })
            .catch((err) => {
              console.log(err);
              setStatus('𐄂 ' + err.message);
            });
        }}
      >
        Authenticate to GitHub {status}
      </button>
    </div>
  );
};

const App = () => {
  const [token, setToken] = React.useState(
    localStorage.getItem('github-token')
  );
  console.log(token);
  return (
    <Fragment>
      <header className="header">
        <h1 className="header-title">
          <a href="/">Create InstantSearch App</a>
        </h1>
        <p className="header-subtitle">templates</p>
      </header>
      <Auth onAuth={setToken} />
      <main>
        <section>
          <h2>
            All the Create InstantSearch App templates available on
            CodeSandbox here:
          </h2>
          <Fetch url={templatesRoot} token={token}>
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
          <h2>Custom templates are available on CodeSandbox here:</h2>

          <Listing
            data={[
              {
                id: 'instantsearch.js',
                name: 'Magento 1',
                url: 'https://github.com/Haroenv/magento1-algolia-frontend-demo'.replace(
                  'github.com',
                  'codesandbox.io/s/github'
                ),
                native: false,
                instantsearch: true,
                repo: 'https://github.com/Haroenv/magento1-algolia-frontend-demo',
              },
              {
                id: 'instantsearch.js',
                name: 'Shopify',
                url: 'https://codesandbox.io/s/praagyajoshialgolia-shopify-sandbox-oxx8q',
                native: false,
                instantsearch: true,
                repo: 'https://github.com/praagyajoshi/algolia-shopify-sandbox',
              },
            ]}
          />
        </section>
        <section>
          <h2>
            All the documentation code samples available on
            CodeSandbox here:
          </h2>
          <Fetch url={codeSamplesRoot} token={token}>
            {({ data, error, failed }) =>
              !failed && data && data.tree ? (
                data.tree
                  .filter(
                    (node) =>
                      node.type === 'tree' &&
                      node.path !== '.circleci'
                  )
                  .map((node) => (
                    <section key={node.sha}>
                      <h3>{node.path}</h3>
                      <Fetch url={node.url} token={token}>
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
          {[
            'instantsearch.js',
            'angular-instantsearch',
            'react-instantsearch',
            'vue-instantsearch',
          ].map((lib) => (
            <section>
              <h3>{lib}</h3>
              <Fetch url={getExamplesUrl(lib)} token={token}>
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
                          id: lib,
                          native: false,
                          repo: html_url,
                        }))}
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
          ))}
        </section>
      </main>
    </Fragment>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
