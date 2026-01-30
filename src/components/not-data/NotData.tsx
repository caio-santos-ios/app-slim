import { MdOutlineScreenSearchDesktop } from "react-icons/md"

export const NotData = () => {
    return (
        <div className="h-[50dvh] flex col justify-center items-center">
            <div className="text-gray-500 dark:text-gray-400 flex flex-col justify-center items-center">
                <MdOutlineScreenSearchDesktop className="text-[30dvh]" />
                <h1 className="text-xl">Nenhum registro foi encontrado</h1>
            </div>
        </div>
    )
}