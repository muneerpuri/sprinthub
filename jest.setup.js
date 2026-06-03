import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock react-redux hooks
jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
  Provider: ({ children }) => <>{children}</>,
}));

// Mock framer-motion to simplify render in JSDOM environment
jest.mock("framer-motion", () => {
  const React = require("react");
  const actual = jest.requireActual("framer-motion");
  const customMotion = {};
  const elements = [
    "div",
    "span",
    "p",
    "button",
    "a",
    "img",
    "form",
    "section",
    "nav",
    "ul",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ];
  elements.forEach((tag) => {
    customMotion[tag] = React.forwardRef(
      (
        {
          children,
          initial,
          animate,
          transition,
          exit,
          variants,
          whileHover,
          whileTap,
          ...props
        },
        ref,
      ) => {
        return React.createElement(tag, { ref, ...props }, children);
      },
    );
  });
  return {
    ...actual,
    motion: customMotion,
    AnimatePresence: ({ children }) => children,
  };
});

// Mock Supabase Client globally
jest.mock("@/utils/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: null }, error: null }),
      ),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
    })),
  },
}));

// Mock DashboardLayout globally using its physical path relative to this setup file
jest.mock("./src/components/layout/DashboardLayout", () => ({ children }) => (
  <div data-testid="dashboard-layout">{children}</div>
));
