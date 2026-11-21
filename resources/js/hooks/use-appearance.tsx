// Sattr is light-only. This keeps the starter kit's hook API so its
// components (toasts, two-factor modal) keep working unchanged.
export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

export function initializeTheme(): void {}

export function useAppearance(): UseAppearanceReturn {
    return {
        appearance: 'light',
        resolvedAppearance: 'light',
        updateAppearance: () => {},
    };
}
