import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import { Switch } from 'react-router';
import { store } from './state';
import { Updaters } from './state/updaters';
import Modals from './providers/Modals';
import { ExternalProvider, JsonRpcFetchFunc, Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';
import loadable from '@loadable/component';
import { ContractProvider } from './providers/ContractProvider';
import { Theme } from './providers/Theme/Theme';
import Header from './components/Layout/Header';
import { Popups } from './components/Popups';
import { MainWrapper } from './components/Layout/MainWrapper';

const getLibrary = (p: ExternalProvider | JsonRpcFetchFunc) => {
  return new Web3Provider(p);
};

const Swap = loadable(() => import('./views/Swap').then((t) => t.default));
const Pools = loadable(() => import('./views/Pools').then((t) => t.default));
const PoolDetail = loadable(() => import('./views/PoolDetail').then((t) => t.default));
const Farms = loadable(() => import('./views/Farms').then((t) => t.default));
const Staking = loadable(() => import('./views/Staking').then((t) => t.default));

export const App: React.FC = () => {
  return (
    <Providers>
      <Popups />
      <Header />
      <MainWrapper>
        <Switch>
          {/* <Route path="/" exact component={Swap} />
          <Route path="/pools/:id" component={PoolDetail} />
          <Route path="/pools" exact component={Pools} /> */}
          <Route path="/farms" component={Farms} />
          {/* <Route path="/staking" component={Staking} /> */}
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
