type TProp = {
    className?: string;
}

export const Logo = ({className}: TProp) => {
    return (
        <div className={`${className}`}>
            <img
                className="h-full"
                src="/aplicativo/icon-512x512.png"
                alt="Logo"
            />
        </div>
    )
}