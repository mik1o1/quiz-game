import Head from 'next/head'
import MainHome from '@/components/Home/MainHome'
import GameModes from '@/components/Home/GameModes'
import Categories from '@/components/Home/Categories'
import { useEffect } from 'react'
import DataLoader from '@/components/DataLoader'; // Adjust the import path as necessary



export default function Main () {
	useEffect(() => { window.onbeforeunload = () => null }, [])

	return (
		<>
			<Head>
				<title>Chewata Trivia</title>
			</Head>
			<DataLoader /> {/* This will refresh data on load */}
			<MainHome />
			<GameModes />
			<Categories />
			<style jsx global>
				{`
				#__next {
					display: grid;
	        grid-template-columns: 1fr;
				}
        @media (min-width: 1024px) {
          #__next {
            grid-template-columns: 1.4fr 1fr;
          }
			  `}
			</style>
		</>
	)
}
