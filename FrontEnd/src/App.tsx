import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { store } from './state';
import { Updaters } from './state/updaters';
import Modals from './providers/Modals';
import { ExternalProvider, JsonRpcFetchFunc, Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';
import { ContractProvider } from './providers/ContractProvider';
import { Theme } from './providers/Theme/Theme';
import Header from './components/Layout/Header';
import { Popups } from './components/Popups';
import { MainWrapper } from './components/Layout/MainWrapper';
import loadable from '@loadable/component';

const getLibrary = (p: ExternalProvider | JsonRpcFetchFunc) => {
  return new Web3Provider(p);
};

const Farms = loadable(() => import('./views/Farms').then((t) => t.default));
const Vaults = loadable(() => import('./views/Vaults').then((t) => t.default));

export const App: React.FC = () => {
  return (
    <Providers>
      <Popups />
      <Header />
      <MainWrapper>
        <Switch>
          <Route path="/farms" component={Farms} />
          <Route path="/vaults" component={Vaults} />
          <Route exact path="/">
            <Redirect to="/farms" />
          </Route>
        </Switch>
      </MainWrapper>
    </Providers>
  );
};

export default App;

const Providers: React.FC = ({ children }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Provider store={store}>
        <Theme>
          <ContractProvider>
            <Updaters />
            <Modals>
              <BrowserRouter>{children}</BrowserRouter>
            </Modals>
          </ContractProvider>
        </Theme>
      </Provider>
    </Web3ReactProvider>
  );
};
