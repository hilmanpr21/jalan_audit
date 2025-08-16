import './PanelNavigation.css';

const PanelNavigation = ({ activeMode, onModeChange }) => {
    return (
        <div className='panel-navigation'>
            <button
                className={`nav-indicator ${activeMode === 'report' ? 'active' : ''}`}
                onClick={() => onModeChange('report')}
                aria-label="Switch to report mode"
            >
                <span className='nav-dot'></span>
                <span className='nav-label'>Report</span>
            </button> 

            <button
                className={`nav-indicator ${activeMode === 'visualisation' ? 'active' : ''}`}
                onClick={() => onModeChange('visualisation')}
                aria-label="Switch to visualisation mode"
            >
                <span className='nav-dot'></span>
                <span className='nav-label'>Visualisation</span>
            </button>

        </div>
    )
}

export default PanelNavigation;

