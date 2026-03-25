import logo from '../Assets/tcc_logo.png';

export default function ApplicationLogo(props) {
    return (
        <img 
        {...props}
        src={logo} 
        alt="The Cat Clinic Logo" 
        className={`w-auto object-contain ${props.className || ''}`} 
        />
    );
}
