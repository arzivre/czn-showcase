import { ASSETS_URL } from "@/constants/assets-url";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { FaHeart } from "react-icons/fa6";

type TListSavedData = {
    savedData: Array<{
        rank?: number | undefined;
        id: string;
        userId: string;
        title: string;
        descriptionHtml: string | null;
        descriptionText: string | null;
        combatant: string;
        imgUrl: string;
        bookmarkCount: number;
        searchVector: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>
}

export function ListSavedData(props: TListSavedData) {
    return (
        <ul className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-12 mb-8">
            {props.savedData.map(saved => (
                <li
                    key={saved.id}
                    className="group border-8 shadow overflow-hidden">
                    <Link
                        to="/saved-data/$id"
                        params={{
                            id: String(saved.id),
                        }}
                        preloadDelay={600}
                    >
                        <Image
                            alt={saved.title}
                            src={`${ASSETS_URL}/${saved.imgUrl}`}
                            layout="constrained"
                            width={467.2}
                            height={262.8}
                            className="aspect-video object-cover w-full"
                        />
                        <div className="grid grid-cols-[1fr_auto] items-center justify-end p-2 border-t">
                            <p className="text-left text-muted-foreground line-clamp-1 group-hover:text-white">
                                {saved.title}
                            </p>
                            <p className="flex items-center gap-1 text-rose-400">
                                <FaHeart className="" /> {saved.bookmarkCount}
                            </p>
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    )
}