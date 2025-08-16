import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './ReportForm.css';

// option Array for the category
const categoryOptions = [
    { value: 'physical environment', label: 'Observed—physical environment (i.e. footways, crossings, lighting, step-free access, seating, signage, green/blue spaces, etc.)' },
    { value: 'emotional perception', label: 'Felt—emotional perceptions (i.e. comfort, sense of belonging, fear of crime, signs of neglect, feelings that may be shaped by the physical environment)' }
];

// option Array for the subcategory
const subcategoryOptions = [
    { value: 'safety', label: 'Safety' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'walkability', label: 'Walkability' }
]

export default function ReportForm({ coordinates }) {
    const [category, setCategory] = useState(['physical environment']); // Array for multiple categories, with default values 'physical environment'
    const [subcategory, setSubcategory] = useState([]); // Array for multiple subcategories, with default values empty array
    const [description, setDescription] = useState(''); // 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setmessage] = useState('');

    // Debug: Log coordinates when they change
    console.log('📍 ReportForm received coordinates:', coordinates);

    // Track coordinate changes with useEffect
    useEffect(() => {
        console.log('🔄 ReportForm useEffect - coordinates changed:', coordinates);
    }, [coordinates]);

    // Handle for subcategory and category checkbox
    const handleCheckboxChange = (value, currentArray, setterFunction) => {
        setterFunction(prev => 
            prev.includes(value)
                ? prev.filter(item => item !== value)   // remove items if it was selected
                : [...prev, value]                      // add if doesn't exist
        );
    };

    // Form Submission Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // check if at least one category is selected 
        if (category.length === 0) {
            setmessage('Category is required');
            setIsSubmitting(false);
        }

        const { error } = await supabase
            .from('reports')
            .insert({
                category,
                subcategory: subcategory.length > 0  ? subcategory : null,  // to put either subcategory array or null, so not submitting empty array
                description,
                lng: coordinates?.lng,
                lat: coordinates?.lat,
            });

        setmessage(error ? 'Error submitting report' : 'Report submitted! Thank you');
        if (!error) {
            setDescription('')
            setSubcategory([]);  // Reset subcategory selections
            setCategory(['physical environment']); // Reset category to default
        }; //reset on success
        setIsSubmitting(false);
    };

    return (
        <div className="sidebar">
            <div className='sidebar-title'>
                <h3>Let's Audit!</h3>
                <p>Adjust the map pin to set the location</p>
            </div>
            
            <form onSubmit={handleSubmit}>
                
                <p>Category: <span style={{color: 'red'}}>*</span></p>
                <div className='checkbox-group category'>
                    {categoryOptions.map(option => (
                        <label key={option.value}>
                            <input
                                type="checkbox"
                                checked={category.includes(option.value)}
                                onChange={() => handleCheckboxChange(option.value, category, setCategory)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                <p>Tick all that apply:</p>
                <div className='checkbox-group subcategory'>
                    {subcategoryOptions.map(option => (
                        <label key={option.value}>
                            <input
                                type="checkbox"
                                checked={subcategory.includes(option.value)}    // it automatically checks if the option value is in the subcategory array
                                onChange={() => handleCheckboxChange(option.value, subcategory, setSubcategory)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                
                <p>Detailed description:</p>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue..."
                    required
                />

                <button
                    type="submit"
                    disabled={isSubmitting || !coordinates || category.length === 0}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>

                {message && <p className="message">{message}</p>}
            </form>
        </div>
    );
}