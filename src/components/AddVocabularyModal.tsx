import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react';

interface AddVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWords: (words: { english: string; armenian: string }[]) => void;
}

type Level = 'beginner' | 'intermediate' | 'advanced';
type Category = 'travel' | 'food' | 'emotions' | 'daily' | 'work';

const vocabularyData: Record<Level, Record<Category, { english: string; armenian: string }[]>> = {
  beginner: {
    travel: [
      { english: 'Airport', armenian: 'Օդանավակայան' },
      { english: 'Hotel', armenian: 'Հյուրանոց' },
      { english: 'Taxi', armenian: 'Տաքսի' },
      { english: 'Train', armenian: 'Գնացք' },
      { english: 'Bus', armenian: 'Ավտոբուս' },
      { english: 'Ticket', armenian: 'Տոմս' },
      { english: 'Passport', armenian: 'Անձնագիր' },
      { english: 'Luggage', armenian: 'Ճամպրուկ' },
      { english: 'Map', armenian: 'Քարտեզ' },
      { english: 'Tourist', armenian: 'Տուրիստ' },
      { english: 'Guide', armenian: 'Ուղեցույց' },
      { english: 'Camera', armenian: 'Ֆոտոապարատ' },
      { english: 'Beach', armenian: 'Ծովափ' },
      { english: 'Mountain', armenian: 'Լեռ' },
      { english: 'City', armenian: 'Քաղաք' },
      { english: 'Village', armenian: 'Գյուղ' },
      { english: 'Restaurant', armenian: 'Ռեստորան' },
      { english: 'Museum', armenian: 'Թանգարան' },
      { english: 'Church', armenian: 'Եկեղեցի' },
      { english: 'Market', armenian: 'Շուկա' }
    ],
    food: [
      { english: 'Bread', armenian: 'Հաց' },
      { english: 'Water', armenian: 'Ջուր' },
      { english: 'Milk', armenian: 'Կաթ' },
      { english: 'Cheese', armenian: 'Պանիր' },
      { english: 'Meat', armenian: 'Միս' },
      { english: 'Fish', armenian: 'Ձուկ' },
      { english: 'Chicken', armenian: 'Հավ' },
      { english: 'Egg', armenian: 'Ձու' },
      { english: 'Rice', armenian: 'Բրինձ' },
      { english: 'Potato', armenian: 'Կարտոֆիլ' },
      { english: 'Tomato', armenian: 'Լոլիկ' },
      { english: 'Onion', armenian: 'Սոխ' },
      { english: 'Apple', armenian: 'Խնձոր' },
      { english: 'Orange', armenian: 'Նարինջ' },
      { english: 'Banana', armenian: 'Բանան' },
      { english: 'Grape', armenian: 'Խաղող' },
      { english: 'Salt', armenian: 'Աղ' },
      { english: 'Sugar', armenian: 'Շաքար' },
      { english: 'Tea', armenian: 'Թեյ' },
      { english: 'Coffee', armenian: 'Սուրճ' }
    ],
    emotions: [
      { english: 'Happy', armenian: 'Ուրախ' },
      { english: 'Sad', armenian: 'Տխուր' },
      { english: 'Angry', armenian: 'Բարկացած' },
      { english: 'Excited', armenian: 'Հուզված' },
      { english: 'Tired', armenian: 'Հոգնած' },
      { english: 'Hungry', armenian: 'Քաղցած' },
      { english: 'Thirsty', armenian: 'Ծարավ' },
      { english: 'Cold', armenian: 'Ցուրտ' },
      { english: 'Hot', armenian: 'Տաք' },
      { english: 'Sick', armenian: 'Հիվանդ' },
      { english: 'Healthy', armenian: 'Առողջ' },
      { english: 'Strong', armenian: 'Ուժեղ' },
      { english: 'Weak', armenian: 'Թույլ' },
      { english: 'Beautiful', armenian: 'Գեղեցիկ' },
      { english: 'Ugly', armenian: 'Տգեղ' },
      { english: 'Good', armenian: 'Լավ' },
      { english: 'Bad', armenian: 'Վատ' },
      { english: 'Big', armenian: 'Մեծ' },
      { english: 'Small', armenian: 'Փոքր' },
      { english: 'New', armenian: 'Նոր' }
    ],
    daily: [
      { english: 'Morning', armenian: 'Առավոտ' },
      { english: 'Afternoon', armenian: 'Կեսօր' },
      { english: 'Evening', armenian: 'Երեկո' },
      { english: 'Night', armenian: 'Գիշեր' },
      { english: 'Today', armenian: 'Այսօր' },
      { english: 'Tomorrow', armenian: 'Վաղը' },
      { english: 'Yesterday', armenian: 'Երեկ' },
      { english: 'Week', armenian: 'Շաբաթ' },
      { english: 'Month', armenian: 'Ամիս' },
      { english: 'Year', armenian: 'Տարի' },
      { english: 'Home', armenian: 'Տուն' },
      { english: 'Work', armenian: 'Աշխատանք' },
      { english: 'School', armenian: 'Դպրոց' },
      { english: 'Friend', armenian: 'Ընկեր' },
      { english: 'Family', armenian: 'Ընտանիք' },
      { english: 'Mother', armenian: 'Մայր' },
      { english: 'Father', armenian: 'Հայր' },
      { english: 'Child', armenian: 'Երեխա' },
      { english: 'Money', armenian: 'Փող' },
      { english: 'Time', armenian: 'Ժամանակ' }
    ],
    work: [
      { english: 'Job', armenian: 'Աշխատանք' },
      { english: 'Office', armenian: 'Գրասենյակ' },
      { english: 'Computer', armenian: 'Համակարգիչ' },
      { english: 'Phone', armenian: 'Հեռախոս' },
      { english: 'Email', armenian: 'Էլ. փոստ' },
      { english: 'Meeting', armenian: 'Հանդիպում' },
      { english: 'Boss', armenian: 'Ղեկավար' },
      { english: 'Employee', armenian: 'Աշխատակից' },
      { english: 'Salary', armenian: 'Աշխատավարձ' },
      { english: 'Project', armenian: 'Նախագիծ' },
      { english: 'Report', armenian: 'Զեկույց' },
      { english: 'Document', armenian: 'Փաստաթուղթ' },
      { english: 'Printer', armenian: 'Տպիչ' },
      { english: 'Paper', armenian: 'Թուղթ' },
      { english: 'Pen', armenian: 'Գրիչ' },
      { english: 'Desk', armenian: 'Սեղան' },
      { english: 'Chair', armenian: 'Աթոռ' },
      { english: 'Schedule', armenian: 'Ժամանակացույց' },
      { english: 'Deadline', armenian: 'Վերջնաժամկետ' },
      { english: 'Team', armenian: 'Թիմ' }
    ]
  },
  intermediate: {
    travel: [
      { english: 'Reservation', armenian: 'Ամրագրում' },
      { english: 'Departure', armenian: 'Մեկնում' },
      { english: 'Arrival', armenian: 'Ժամանում' },
      { english: 'Destination', armenian: 'Նպատակակետ' },
      { english: 'Journey', armenian: 'Ճանապարհորդություն' },
      { english: 'Adventure', armenian: 'Արկածախնդրություն' },
      { english: 'Experience', armenian: 'Փորձառություն' },
      { english: 'Culture', armenian: 'Մշակույթ' },
      { english: 'Tradition', armenian: 'Ավանդույթ' },
      { english: 'Language', armenian: 'Լեզու' },
      { english: 'Translation', armenian: 'Թարգմանություն' },
      { english: 'Communication', armenian: 'Հաղորդակցություն' },
      { english: 'Emergency', armenian: 'Արտակարգ իրավիճակ' },
      { english: 'Insurance', armenian: 'Ապահովագրություն' },
      { english: 'Currency', armenian: 'Արժույթ' },
      { english: 'Exchange', armenian: 'Փոխանակում' },
      { english: 'Souvenir', armenian: 'Հիշատակ' },
      { english: 'Itinerary', armenian: 'Ճանապարհային ծրագիր' },
      { english: 'Accommodation', armenian: 'Բնակարան' },
      { english: 'Transportation', armenian: 'Տրանսպորտ' }
    ],
    food: [
      { english: 'Ingredient', armenian: 'Բաղադրիչ' },
      { english: 'Recipe', armenian: 'Բաղադրատոմս' },
      { english: 'Cooking', armenian: 'Պատրաստում' },
      { english: 'Baking', armenian: 'Թխում' },
      { english: 'Seasoning', armenian: 'Համեմունք' },
      { english: 'Flavor', armenian: 'Համ' },
      { english: 'Texture', armenian: 'Հյուսվածք' },
      { english: 'Nutrition', armenian: 'Սնուցում' },
      { english: 'Vitamin', armenian: 'Վիտամին' },
      { english: 'Protein', armenian: 'Սպիտակուց' },
      { english: 'Carbohydrate', armenian: 'Ածխաջուր' },
      { english: 'Vegetarian', armenian: 'Բուսակեր' },
      { english: 'Organic', armenian: 'Օրգանական' },
      { english: 'Fresh', armenian: 'Թարմ' },
      { english: 'Frozen', armenian: 'Սառեցված' },
      { english: 'Spicy', armenian: 'Կծու' },
      { english: 'Sweet', armenian: 'Քաղցր' },
      { english: 'Sour', armenian: 'Թթու' },
      { english: 'Bitter', armenian: 'Դառը' },
      { english: 'Delicious', armenian: 'Համեղ' }
    ],
    emotions: [
      { english: 'Confident', armenian: 'Վստահ' },
      { english: 'Nervous', armenian: 'Նյարդային' },
      { english: 'Anxious', armenian: 'Անհանգիստ' },
      { english: 'Peaceful', armenian: 'Խաղաղ' },
      { english: 'Grateful', armenian: 'Շնորհակալ' },
      { english: 'Disappointed', armenian: 'Հիասթափված' },
      { english: 'Surprised', armenian: 'Զարմացած' },
      { english: 'Confused', armenian: 'Շփոթված' },
      { english: 'Motivated', armenian: 'Դրդված' },
      { english: 'Inspired', armenian: 'Ոգեշնչված' },
      { english: 'Frustrated', armenian: 'Հիասթափված' },
      { english: 'Relaxed', armenian: 'Հանգիստ' },
      { english: 'Stressed', armenian: 'Սթրեսի տակ' },
      { english: 'Optimistic', armenian: 'Լավատես' },
      { english: 'Pessimistic', armenian: 'Վատատես' },
      { english: 'Curious', armenian: 'Հետաքրքրված' },
      { english: 'Bored', armenian: 'Ձանձրացած' },
      { english: 'Jealous', armenian: 'Նախանձող' },
      { english: 'Proud', armenian: 'Հպարտ' },
      { english: 'Ashamed', armenian: 'Ամոթով' }
    ],
    daily: [
      { english: 'Routine', armenian: 'Առօրյա' },
      { english: 'Habit', armenian: 'Սովորություն' },
      { english: 'Schedule', armenian: 'Ժամանակացույց' },
      { english: 'Priority', armenian: 'Առաջնահերթություն' },
      { english: 'Goal', armenian: 'Նպատակ' },
      { english: 'Achievement', armenian: 'Ձեռքբերում' },
      { english: 'Challenge', armenian: 'Մարտահրավեր' },
      { english: 'Opportunity', armenian: 'Հնարավորություն' },
      { english: 'Decision', armenian: 'Որոշում' },
      { english: 'Choice', armenian: 'Ընտրություն' },
      { english: 'Responsibility', armenian: 'Պատասխանատվություն' },
      { english: 'Independence', armenian: 'Անկախություն' },
      { english: 'Freedom', armenian: 'Ազատություն' },
      { english: 'Privacy', armenian: 'Գաղտնիություն' },
      { english: 'Community', armenian: 'Համայնք' },
      { english: 'Neighborhood', armenian: 'Թաղամաս' },
      { english: 'Relationship', armenian: 'Հարաբերություն' },
      { english: 'Communication', armenian: 'Հաղորդակցություն' },
      { english: 'Understanding', armenian: 'Հասկացողություն' },
      { english: 'Patience', armenian: 'Համբերություն' }
    ],
    work: [
      { english: 'Career', armenian: 'Կարիերա' },
      { english: 'Profession', armenian: 'Մասնագիտություն' },
      { english: 'Experience', armenian: 'Փորձառություն' },
      { english: 'Skill', armenian: 'Հմտություն' },
      { english: 'Qualification', armenian: 'Որակավորում' },
      { english: 'Training', armenian: 'Վերապատրաստում' },
      { english: 'Development', armenian: 'Զարգացում' },
      { english: 'Performance', armenian: 'Կատարում' },
      { english: 'Productivity', armenian: 'Արտադրողականություն' },
      { english: 'Efficiency', armenian: 'Արդյունավետություն' },
      { english: 'Innovation', armenian: 'Նորարարություն' },
      { english: 'Creativity', armenian: 'Ստեղծագործություն' },
      { english: 'Leadership', armenian: 'Առաջնորդություն' },
      { english: 'Teamwork', armenian: 'Թիմային աշխատանք' },
      { english: 'Collaboration', armenian: 'Համագործակցություն' },
      { english: 'Communication', armenian: 'Հաղորդակցություն' },
      { english: 'Presentation', armenian: 'Ներկայացում' },
      { english: 'Negotiation', armenian: 'Բանակցություն' },
      { english: 'Strategy', armenian: 'Ռազմավարություն' },
      { english: 'Management', armenian: 'Կառավարում' }
    ]
  },
  advanced: {
    travel: [
      { english: 'Expedition', armenian: 'Արշավ' },
      { english: 'Pilgrimage', armenian: 'Ուխտագնացություն' },
      { english: 'Excursion', armenian: 'Էքսկուրսիա' },
      { english: 'Reconnaissance', armenian: 'Հետախուզություն' },
      { english: 'Exploration', armenian: 'Հետազոտություն' },
      { english: 'Wanderlust', armenian: 'Ճանապարհորդական ցանկություն' },
      { english: 'Nomadic', armenian: 'Գաղթական' },
      { english: 'Indigenous', armenian: 'Տեղական' },
      { english: 'Cosmopolitan', armenian: 'Համաշխարհային' },
      { english: 'Hospitality', armenian: 'Հյուրասիրություն' },
      { english: 'Authenticity', armenian: 'Իսկականություն' },
      { english: 'Immersion', armenian: 'Խորասուզում' },
      { english: 'Acclimatization', armenian: 'Հարմարվում' },
      { english: 'Orientation', armenian: 'Կողմնորոշում' },
      { english: 'Navigation', armenian: 'Նավարկություն' },
      { english: 'Cartography', armenian: 'Քարտագրություն' },
      { english: 'Topography', armenian: 'Տոպոգրաֆիա' },
      { english: 'Geography', armenian: 'Աշխարհագրություն' },
      { english: 'Anthropology', armenian: 'Մարդաբանություն' },
      { english: 'Archaeology', armenian: 'Հնագիտություն' }
    ],
    food: [
      { english: 'Gastronomy', armenian: 'Գաստրոնոմիա' },
      { english: 'Culinary', armenian: 'Խոհարարական' },
      { english: 'Epicurean', armenian: 'Համապարփակ' },
      { english: 'Gourmet', armenian: 'Գուրմե' },
      { english: 'Connoisseur', armenian: 'Գիտակ' },
      { english: 'Sommelier', armenian: 'Գինու մասնագետ' },
      { english: 'Fermentation', armenian: 'Ֆերմենտացիա' },
      { english: 'Marination', armenian: 'Մարինացիա' },
      { english: 'Caramelization', armenian: 'Կարամելացում' },
      { english: 'Emulsification', armenian: 'Էմուլսիֆիկացիա' },
      { english: 'Molecular', armenian: 'Մոլեկուլային' },
      { english: 'Artisanal', armenian: 'Արհեստավարական' },
      { english: 'Sustainable', armenian: 'Կայուն' },
      { english: 'Biodiversity', armenian: 'Կենսաբազմազանություն' },
      { english: 'Terroir', armenian: 'Տեռուար' },
      { english: 'Provenance', armenian: 'Ծագում' },
      { english: 'Traceability', armenian: 'Հետագծելիություն' },
      { english: 'Authenticity', armenian: 'Իսկականություն' },
      { english: 'Sophistication', armenian: 'Բարդություն' },
      { english: 'Refinement', armenian: 'Բարելավում' }
    ],
    emotions: [
      { english: 'Euphoric', armenian: 'Էյֆորիկ' },
      { english: 'Melancholic', armenian: 'Մելանխոլիկ' },
      { english: 'Nostalgic', armenian: 'Կարոտախտ' },
      { english: 'Contemplative', armenian: 'Մտածողական' },
      { english: 'Introspective', armenian: 'Ինտրոսպեկտիվ' },
      { english: 'Empathetic', armenian: 'Կարեկցող' },
      { english: 'Compassionate', armenian: 'Գթասիրտ' },
      { english: 'Resilient', armenian: 'Դիմացկուն' },
      { english: 'Vulnerable', armenian: 'Խոցելի' },
      { english: 'Stoic', armenian: 'Ստոիկ' },
      { english: 'Philosophical', armenian: 'Փիլիսոփայական' },
      { english: 'Existential', armenian: 'Գոյական' },
      { english: 'Transcendent', armenian: 'Գերազանցող' },
      { english: 'Enlightened', armenian: 'Լուսավորված' },
      { english: 'Serene', armenian: 'Հանգիստ' },
      { english: 'Turbulent', armenian: 'Տարբերակիչ' },
      { english: 'Ambivalent', armenian: 'Երկակի' },
      { english: 'Paradoxical', armenian: 'Հակասական' },
      { english: 'Cathartic', armenian: 'Մաքրող' },
      { english: 'Transformative', armenian: 'Փոխակերպող' }
    ],
    daily: [
      { english: 'Equilibrium', armenian: 'Հավասարակշռություն' },
      { english: 'Synchronicity', armenian: 'Համաժամանակություն' },
      { english: 'Serendipity', armenian: 'Պատահական բարեբախտություն' },
      { english: 'Mindfulness', armenian: 'Գիտակցություն' },
      { english: 'Meditation', armenian: 'Մեդիտացիա' },
      { english: 'Contemplation', armenian: 'Խորհրդածություն' },
      { english: 'Reflection', armenian: 'Արտացոլում' },
      { english: 'Introspection', armenian: 'Ինտրոսպեկցիա' },
      { english: 'Self-awareness', armenian: 'Ինքնագիտակցություն' },
      { english: 'Consciousness', armenian: 'Գիտակցություն' },
      { english: 'Enlightenment', armenian: 'Լուսավորություն' },
      { english: 'Wisdom', armenian: 'Իմաստություն' },
      { english: 'Philosophy', armenian: 'Փիլիսոփայություն' },
      { english: 'Spirituality', armenian: 'Հոգևորություն' },
      { english: 'Transcendence', armenian: 'Գերազանցում' },
      { english: 'Authenticity', armenian: 'Իսկականություն' },
      { english: 'Integrity', armenian: 'Ամբողջականություն' },
      { english: 'Compassion', armenian: 'Կարեկցություն' },
      { english: 'Empathy', armenian: 'Կարեկցություն' },
      { english: 'Gratitude', armenian: 'Շնորհակալություն' }
    ],
    work: [
      { english: 'Entrepreneurship', armenian: 'Ձեռնարկատիրություն' },
      { english: 'Innovation', armenian: 'Նորարարություն' },
      { english: 'Disruption', armenian: 'Խանգարում' },
      { english: 'Transformation', armenian: 'Փոխակերպում' },
      { english: 'Optimization', armenian: 'Օպտիմիզացիա' },
      { english: 'Automation', armenian: 'Ավտոմատացում' },
      { english: 'Digitalization', armenian: 'Թվայնացում' },
      { english: 'Globalization', armenian: 'Գլոբալիզացիա' },
      { english: 'Sustainability', armenian: 'Կայունություն' },
      { english: 'Scalability', armenian: 'Մասշտաբայնություն' },
      { english: 'Agility', armenian: 'Ճկունություն' },
      { english: 'Adaptability', armenian: 'Հարմարվողականություն' },
      { english: 'Resilience', armenian: 'Դիմացկունություն' },
      { english: 'Synergy', armenian: 'Սինեգիա' },
      { english: 'Paradigm', armenian: 'Պարադիգմա' },
      { english: 'Methodology', armenian: 'Մեթոդաբանություն' },
      { english: 'Framework', armenian: 'Շրջանակ' },
      { english: 'Infrastructure', armenian: 'Ենթակառուցվածք' },
      { english: 'Architecture', armenian: 'Ճարտարապետություն' },
      { english: 'Ecosystem', armenian: 'Էկոհամակարգ' }
    ]
  }
};

const AddVocabularyModal: React.FC<AddVocabularyModalProps> = ({ isOpen, onClose, onAddWords }) => {
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const resetModal = () => {
    setStep(1);
    setSelectedLevel(null);
    setSelectedCategory(null);
    setIsAdding(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleAddAll = async () => {
    if (!selectedLevel || !selectedCategory) return;
    
    setIsAdding(true);
    
    // Simulate adding delay
    setTimeout(() => {
      const words = vocabularyData[selectedLevel][selectedCategory];
      onAddWords(words);
      setIsAdding(false);
      handleClose();
    }, 1000);
  };

  const getWordsForSelection = () => {
    if (!selectedLevel || !selectedCategory) return [];
    return vocabularyData[selectedLevel][selectedCategory];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Add Vocabulary</h2>
              <p className="text-sm text-gray-600">Step {step} of 3</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose Your English Level</h3>
                <p className="text-gray-600">Select the level that best matches your current English proficiency</p>
              </div>
              
              <div className="grid gap-4">
                {[
                  { level: 'beginner' as Level, title: 'Beginner', description: 'Basic vocabulary and simple phrases' },
                  { level: 'intermediate' as Level, title: 'Intermediate', description: 'More complex words and expressions' },
                  { level: 'advanced' as Level, title: 'Advanced', description: 'Sophisticated vocabulary and nuanced terms' }
                ].map(({ level, title, description }) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSelectedLevel(level);
                      setStep(2);
                    }}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 text-left"
                  >
                    <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
                    <p className="text-sm text-gray-600">{description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Category</h3>
                <p className="text-gray-600">Choose a topic that interests you most</p>
              </div>
              
              <div className="grid gap-4">
                {[
                  { category: 'travel' as Category, title: 'Travel', description: 'Words for exploring the world' },
                  { category: 'food' as Category, title: 'Food & Eating', description: 'Culinary vocabulary and dining' },
                  { category: 'emotions' as Category, title: 'Emotions', description: 'Feelings and emotional expressions' },
                  { category: 'daily' as Category, title: 'Daily Activities', description: 'Everyday life and routines' },
                  { category: 'work' as Category, title: 'Work & Office', description: 'Professional and workplace terms' }
                ].map(({ category, title, description }) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setStep(3);
                    }}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 text-left"
                  >
                    <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
                    <p className="text-sm text-gray-600">{description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {selectedLevel?.charAt(0).toUpperCase() + selectedLevel?.slice(1)} - {
                    selectedCategory === 'travel' ? 'Travel' :
                    selectedCategory === 'food' ? 'Food & Eating' :
                    selectedCategory === 'emotions' ? 'Emotions' :
                    selectedCategory === 'daily' ? 'Daily Activities' :
                    'Work & Office'
                  }
                </h3>
                <p className="text-gray-600">20 carefully selected words for your level</p>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {getWordsForSelection().map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">{word.english}</span>
                      <span className="text-gray-600 text-sm ml-3">{word.armenian}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                <button
                  onClick={handleAddAll}
                  disabled={isAdding}
                  className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {isAdding ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding Words...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Add All 20 Words</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddVocabularyModal;