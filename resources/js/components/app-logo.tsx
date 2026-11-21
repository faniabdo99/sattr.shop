export default function AppLogo() {
    return (
        <>
            <span
                aria-hidden
                className="hidden size-8 items-center justify-center rounded-md bg-sidebar-primary font-display text-lg leading-none text-sidebar-primary-foreground group-data-[collapsible=icon]:flex"
            >
                S
            </span>
            <span className="px-1 font-display text-2xl leading-none tracking-tight group-data-[collapsible=icon]:hidden">
                Sattr
            </span>
        </>
    );
}
