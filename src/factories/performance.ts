export const createPerformance = () =>
    typeof window === 'undefined' ? null : typeof window.performance === 'undefined' ? null : window.performance;
