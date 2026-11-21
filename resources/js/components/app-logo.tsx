import { Logo } from '@/components/brand/Logo';

export default function AppLogo() {
    return (
        <>
            <span className="hidden group-data-[collapsible=icon]:inline-flex">
                <Logo variant="mark" size={28} />
            </span>
            <span className="inline-flex px-1 group-data-[collapsible=icon]:hidden">
                <Logo variant="lockup" size={28} />
            </span>
        </>
    );
}
