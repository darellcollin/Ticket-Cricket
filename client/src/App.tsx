import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import GameScreen from "./pages/GameScreen";
import RulesScreen from "./pages/RulesScreen";
import CardCatalogScreen from "./pages/CardCatalogScreen";
import LobbyScreen from "./pages/LobbyScreen";
import MultiplayerGameScreen from "./pages/MultiplayerGameScreen";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/game"} component={GameScreen} />
      <Route path={"/rules"} component={RulesScreen} />
      <Route path={"/catalog"} component={CardCatalogScreen} />
      <Route path={"/lobby"} component={LobbyScreen} />
      <Route path={"/multiplayer"} component={MultiplayerGameScreen} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
