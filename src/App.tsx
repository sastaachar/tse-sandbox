import "./styles.css";
import { useState } from "react";

import { Landing } from "./components/landing";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Modal from "react-modal";
Modal.setAppElement("#root");

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ModalProvider } from "./components/GlobalModal";
import { MyLiveboardOne } from "./components/embed/liveboard";
import { MySearchBarEmbed } from "./components/embed/searchBar";
import { MySageEmbed } from "./components/embed/sage";
import { MyAppEmbed } from "./components/embed/fullApp";
import { AppConfigProvider } from "./contexts/appConfig";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/libEmbed">Liveboard Embed</Link>
      <Link to="/searchEmbed">Search Embed</Link>
      <Link to="/sageEmbed">Sage Embed</Link>
      <Link to="/appEmbed">App Embed</Link>
    </nav>
  );
}

function AppRouter() {
  return (
    <div className="App">
      <BrowserRouter>
        <ToastContainer />
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="libEmbed" element={<MyLiveboardOne />} />
          <Route path="searchEmbed" element={<MySearchBarEmbed />} />
          <Route path="sageEmbed" element={<MySageEmbed />} />
          <Route path="appEmbed" element={<MyAppEmbed />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

const localStorageKey = "codeSandBox-jstm";
export default function App() {
  return (
    <AppConfigProvider>
      <ModalProvider>
        <AppRouter />
      </ModalProvider>
    </AppConfigProvider>
  );
}
