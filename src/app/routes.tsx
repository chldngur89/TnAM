import { createBrowserRouter } from "react-router";
import { EmployeeView } from "./components/EmployeeView";
import { ManagerView } from "./components/ManagerView";
import { FlowDiagram } from "./components/FlowDiagram";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: EmployeeView,
  },
  {
    path: "/manager",
    Component: ManagerView,
  },
  {
    path: "/flow",
    Component: FlowDiagram,
  },
]);
