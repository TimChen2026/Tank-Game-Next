import BeamsBackground from '@/components/BeamsBackground';
import NavBar from '@/components/NavBar';
import TankGame from '@/components/TankGame';

export default function Home() {
  return (
    <>
      <BeamsBackground />
      <div id="beams-overlay" />
      <NavBar />
      <TankGame />
    </>
  );
}
