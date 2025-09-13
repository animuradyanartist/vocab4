interface ExtractedWord {
  word: string;
  translation: string;
  context: string;
}

interface ExtractionResult {
  words: ExtractedWord[];
}

// Common English words to filter out (not useful for learning)
const COMMON_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'hello', 'cat', 'dog', 'yes', 'no', 'ok', 'okay', 'please', 'thank', 'thanks', 'welcome', 'sorry', 'excuse', 'help', 'here', 'there', 'where', 'why', 'how', 'what', 'when', 'who', 'which', 'whose', 'whom', 'am', 'is', 'are', 'was', 'were', 'been', 'being', 'has', 'had', 'having', 'does', 'did', 'doing', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'cannot', 'very', 'too', 'much', 'many', 'more', 'most', 'less', 'least', 'few', 'little', 'big', 'small', 'large', 'great', 'long', 'short', 'high', 'low', 'old', 'young', 'early', 'late', 'right', 'left', 'next', 'last', 'same', 'different', 'another', 'each', 'every', 'both', 'either', 'neither', 'such', 'own', 'other', 'another', 'same', 'different'
]);

// Armenian translations for advanced vocabulary
const ARMENIAN_TRANSLATIONS: Record<string, string> = {
  // Advanced vocabulary with Armenian translations
  'ubiquitous': 'բոլոր տեղերում առկա',
  'serendipity': 'բարեպատահ հանդիպում',
  'ephemeral': 'անցողիկ',
  'melancholy': 'մելանխոլիա',
  'eloquent': 'հարուստ խոսք',
  'resilient': 'դիմացկուն',
  'profound': 'խորը',
  'intricate': 'բարդ',
  'ambiguous': 'երկիմաստ',
  'sophisticated': 'բարդ',
  'meticulous': 'մանրակրկիտ',
  'pragmatic': 'գործնական',
  'innovative': 'նորարարական',
  'comprehensive': 'համապարփակ',
  'substantial': 'զգալի',
  'significant': 'կարևոր',
  'fundamental': 'հիմնական',
  'essential': 'կարևոր',
  'crucial': 'վճռական',
  'vital': 'կենսական',
  'prominent': 'նշանավոր',
  'remarkable': 'նշանակալի',
  'extraordinary': 'արտակարգ',
  'magnificent': 'հիանալի',
  'tremendous': 'հսկայական',
  'enormous': 'հսկայական',
  'immense': 'անսահման',
  'vast': 'ընդարձակ',
  'extensive': 'ընդարձակ',
  'abundant': 'առատ',
  'scarce': 'սակավ',
  'rare': 'հազվագյուտ',
  'unique': 'եզակի',
  'distinct': 'տարբեր',
  'diverse': 'բազմազան',
  'complex': 'բարդ',
  'simple': 'պարզ',
  'obvious': 'ակնհայտ',
  'evident': 'ակնհայտ',
  'apparent': 'ակնհայտ',
  'subtle': 'նուրբ',
  'delicate': 'նուրբ',
  'fragile': 'փխրուն',
  'robust': 'ամուր',
  'sturdy': 'ամուր',
  'durable': 'ամուր',
  'temporary': 'ժամանակավոր',
  'permanent': 'մշտական',
  'constant': 'մշտական',
  'variable': 'փոփոխական',
  'flexible': 'ճկուն',
  'rigid': 'կոշտ',
  'dynamic': 'դինամիկ',
  'static': 'անշարժ',
  'active': 'ակտիվ',
  'passive': 'պասիվ',
  'aggressive': 'ագրեսիվ',
  'peaceful': 'խաղաղ',
  'harmonious': 'ներդաշնակ',
  'chaotic': 'քաոսային',
  'organized': 'կազմակերպված',
  'systematic': 'համակարգված',
  'random': 'պատահական',
  'deliberate': 'դիտավորյալ',
  'intentional': 'դիտավորյալ',
  'accidental': 'պատահական',
  'spontaneous': 'ինքնաբուխ',
  'planned': 'պլանավորված',
  'strategic': 'ռազմավարական',
  'tactical': 'մարտավարական',
  'practical': 'գործնական',
  'theoretical': 'տեսական',
  'abstract': 'վերացական',
  'concrete': 'կոնկրետ',
  'specific': 'հատուկ',
  'general': 'ընդհանուր',
  'universal': 'համընդհանուր',
  'particular': 'հատուկ',
  'individual': 'անհատական',
  'collective': 'կոլեկտիվ',
  'social': 'սոցիալական',
  'personal': 'անձնական',
  'private': 'մասնավոր',
  'public': 'հանրային',
  'official': 'պաշտոնական',
  'informal': 'ոչ պաշտոնական',
  'casual': 'պատահական',
  'formal': 'պաշտոնական',
  'professional': 'մասնագիտական',
  'amateur': 'սիրողական',
  'expert': 'փորձագետ',
  'novice': 'սկսնակ',
  'experienced': 'փորձառու',
  'skilled': 'հմուտ',
  'talented': 'տաղանդավոր',
  'gifted': 'տաղանդավոր',
  'capable': 'ունակ',
  'competent': 'գիտակ',
  'efficient': 'արդյունավետ',
  'effective': 'արդյունավետ',
  'productive': 'արտադրողական',
  'successful': 'հաջողակ',
  'prosperous': 'բարգավաճ',
  'wealthy': 'հարուստ',
  'affluent': 'հարուստ',
  'poor': 'աղքատ',
  'impoverished': 'աղքատացած',
  'destitute': 'անապահով',
  'fortunate': 'բախտավոր',
  'lucky': 'բախտավոր',
  'unfortunate': 'դժբախտ',
  'miserable': 'թշվառ',
  'content': 'գոհ',
  'satisfied': 'գոհ',
  'pleased': 'գոհ',
  'delighted': 'ուրախ',
  'ecstatic': 'ցնծող',
  'thrilled': 'հուզված',
  'excited': 'հուզված',
  'enthusiastic': 'ոգևորված',
  'passionate': 'կիրքով',
  'devoted': 'նվիրված',
  'dedicated': 'նվիրված',
  'committed': 'նվիրված',
  'loyal': 'հավատարմ',
  'faithful': 'հավատարմ',
  'reliable': 'վստահելի',
  'dependable': 'վստահելի',
  'trustworthy': 'վստահելի',
  'honest': 'ազնիվ',
  'sincere': 'անկեղծ',
  'genuine': 'իսկական',
  'authentic': 'իսկական',
  'legitimate': 'օրինական',
  'valid': 'վավեր',
  'accurate': 'ճշգրիտ',
  'precise': 'ճշգրիտ',
  'exact': 'ճշգրիտ',
  'approximate': 'մոտավոր',
  'rough': 'կոպիտ',
  'smooth': 'հարթ',
  'gentle': 'նուրբ',
  'harsh': 'կոշտ',
  'severe': 'խիստ',
  'mild': 'մեղմ',
  'moderate': 'չափավոր',
  'extreme': 'ծայրահեղ',
  'intense': 'ինտենսիվ',
  'powerful': 'հզոր',
  'strong': 'ուժեղ',
  'weak': 'թույլ',
  'feeble': 'թույլ',
  'frail': 'թույլ',
  'vulnerable': 'խոցելի',
  'secure': 'ապահով',
  'safe': 'ապահով',
  'dangerous': 'վտանգավոր',
  'risky': 'ռիսկային',
  'hazardous': 'վտանգավոր',
  'perilous': 'վտանգավոր',
  'treacherous': 'դավաճան',
  'deceptive': 'խաբուսիկ',
  'misleading': 'մոլորեցնող',
  'confusing': 'շփոթեցնող',
  'puzzling': 'հանելուկային',
  'mysterious': 'գաղտնիքային',
  'enigmatic': 'հանելուկային',
  'cryptic': 'գաղտնի',
  'obscure': 'անհասկանալի',
  'vague': 'անորոշ',
  'unclear': 'անհասկանալի',
  'transparent': 'թափանցիկ',
  'clear': 'պարզ',
  'distinct': 'տարբեր',
  'blurred': 'մշուշապատ',
  'fuzzy': 'մշուշապատ',
  'sharp': 'սուր',
  'dull': 'բութ',
  'bright': 'պայծառ',
  'dim': 'մգ',
  'dark': 'մութ',
  'light': 'լուսավոր',
  'brilliant': 'փայլուն',
  'radiant': 'ճառագող',
  'glowing': 'փայլող',
  'shining': 'փայլող',
  'sparkling': 'փայլփլող',
  'gleaming': 'փայլող',
  'glistening': 'փայլփլող',
  'shimmering': 'փայլփլող',
  'twinkling': 'փայլփլող',
  'flickering': 'պայծառացող',
  'flashing': 'փայլատակող',
  'blazing': 'բոցավառ',
  'burning': 'այրվող',
  'scorching': 'այրող',
  'freezing': 'սառեցնող',
  'chilling': 'սառեցնող',
  'refreshing': 'թարմացնող',
  'invigorating': 'ոգևորող',
  'stimulating': 'խթանող',
  'inspiring': 'ոգևորող',
  'motivating': 'դրդող',
  'encouraging': 'քաջալերող',
  'supportive': 'աջակցող',
  'helpful': 'օգտակար',
  'beneficial': 'օգտակար',
  'advantageous': 'օգտակար',
  'favorable': 'բարենպաստ',
  'positive': 'դրական',
  'negative': 'բացասական',
  'neutral': 'չեզոք',
  'objective': 'օբյեկտիվ',
  'subjective': 'սուբյեկտիվ',
  'biased': 'կողմնակալ',
  'impartial': 'անկողմնակալ',
  'fair': 'արդար',
  'unfair': 'անարդար',
  'just': 'արդար',
  'unjust': 'անարդար',
  'righteous': 'արդար',
  'moral': 'բարոյական',
  'ethical': 'էթիկական',
  'virtuous': 'առաքինի',
  'noble': 'ազնիվ',
  'honorable': 'պատվավոր',
  'respectable': 'հարգելի',
  'admirable': 'հիանալի',
  'praiseworthy': 'գովելի',
  'commendable': 'գովելի',
  'exemplary': 'օրինակելի',
  'outstanding': 'գերազանց',
  'exceptional': 'բացառիկ',
  'noteworthy': 'ուշագրավ',
  'critical': 'կրիտիկական',
  'necessary': 'անհրաժեշտ',
  'required': 'պահանջվող',
  'mandatory': 'պարտադիր',
  'optional': 'ընտրովի',
  'voluntary': 'կամավոր',
  'compulsory': 'պարտադիր',
  'obligatory': 'պարտադիր',
  'phenomenon': 'երևույթ',
  'paradigm': 'պարադիգմ',
  'methodology': 'մեթոդաբանություն',
  'infrastructure': 'ենթակառուցվածք',
  'architecture': 'ճարտարապետություն',
  'ecosystem': 'էկոհամակարգ',
  'sustainability': 'կայունություն',
  'optimization': 'օպտիմիզացիա',
  'automation': 'ավտոմատացում',
  'digitalization': 'թվայնացում',
  'globalization': 'գլոբալիզացիա',
  'transformation': 'փոխակերպում',
  'innovation': 'նորարարություն',
  'disruption': 'խանգարում',
  'entrepreneurship': 'ձեռնարկատիրություն',
  'collaboration': 'համագործակցություն',
  'communication': 'հաղորդակցություն',
  'presentation': 'ներկայացում',
  'negotiation': 'բանակցություն',
  'strategy': 'ռազմավարություն',
  'management': 'կառավարում',
  'leadership': 'առաջնորդություն',
  'teamwork': 'թիմային աշխատանք',
  'creativity': 'ստեղծագործություն',
  'productivity': 'արտադրողականություն',
  'efficiency': 'արդյունավետություն',
  'performance': 'կատարում',
  'development': 'զարգացում',
  'training': 'վերապատրաստում',
  'qualification': 'որակավորում',
  'skill': 'հմտություն',
  'experience': 'փորձառություն',
  'profession': 'մասնագիտություն',
  'career': 'կարիերա',
  'achievement': 'ձեռքբերում',
  'goal': 'նպատակ',
  'priority': 'առաջնահերթություն',
  'schedule': 'ժամանակացույց',
  'habit': 'սովորություն',
  'routine': 'առօրյա',
  'challenge': 'մարտահրավեր',
  'opportunity': 'հնարավորություն',
  'decision': 'որոշում',
  'choice': 'ընտրություն',
  'responsibility': 'պատասխանատվություն',
  'independence': 'անկախություն',
  'freedom': 'ազատություն',
  'privacy': 'գաղտնիություն',
  'community': 'համայնք',
  'neighborhood': 'թաղամաս',
  'relationship': 'հարաբերություն',
  'understanding': 'հասկացողություն',
  'patience': 'համբերություն',
  'confidence': 'վստահություն',
  'anxiety': 'անհանգստություն',
  'curiosity': 'հետաքրքրություն',
  'enthusiasm': 'ոգևորություն',
  'motivation': 'դրդում',
  'inspiration': 'ոգեշնչում',
  'determination': 'վճռականություն',
  'perseverance': 'համառություն',
  'persistence': 'կայունություն',
  'consistency': 'հետևողականություն',
  'reliability': 'վստահելիություն',
  'accountability': 'հաշվետվողականություն',
  'transparency': 'թափանցիկություն',
  'integrity': 'ամբողջականություն',
  'authenticity': 'իսկականություն',
  'credibility': 'հավատարմություն',
  'reputation': 'համբավ',
  'recognition': 'ճանաչում',
  'appreciation': 'գնահատում',
  'gratitude': 'շնորհակալություն',
  'compassion': 'կարեկցություն',
  'empathy': 'կարեկցություն',
  'sympathy': 'կարեկցություն',
  'tolerance': 'հանդուրժողականություն',
  'acceptance': 'ընդունում',
  'forgiveness': 'ներում',
  'reconciliation': 'հաշտություն',
  'harmony': 'ներդաշնակություն',
  'balance': 'հավասարակշռություն',
  'stability': 'կայունություն',
  'security': 'անվտանգություն',
  'protection': 'պաշտպանություն',
  'preservation': 'պահպանում',
  'conservation': 'պահպանում',
  'restoration': 'վերականգնում',
  'renovation': 'վերանորոգում',
  'improvement': 'բարելավում',
  'enhancement': 'բարելավում',
  'advancement': 'առաջընթաց',
  'progress': 'առաջընթաց',
  'evolution': 'էվոլյուցիա',
  'revolution': 'հեղափոխություն',
  'transformation': 'փոխակերպում',
  'adaptation': 'հարմարվում',
  'adjustment': 'կարգավորում',
  'modification': 'փոփոխություն',
  'alteration': 'փոփոխություն',
  'variation': 'տատանում',
  'diversity': 'բազմազանություն',
  'complexity': 'բարդություն',
  'simplicity': 'պարզություն',
  'clarity': 'պարզություն',
  'precision': 'ճշգրտություն',
  'accuracy': 'ճշգրտություն',
  'reliability': 'վստահելիություն',
  'consistency': 'հետևողականություն',
  'stability': 'կայունություն',
  'durability': 'ամրություն',
  'flexibility': 'ճկունություն',
  'adaptability': 'հարմարվողականություն',
  'versatility': 'բազմակողմանիություն',
  'functionality': 'գործառնականություն',
  'usability': 'օգտագործելիություն',
  'accessibility': 'մատչելիություն',
  'availability': 'հասանելիություն',
  'compatibility': 'համատեղելիություն',
  'interoperability': 'փոխգործակցություն',
  'connectivity': 'կապակցություն',
  'integration': 'ինտեգրացիա',
  'synchronization': 'համաժամանակացում',
  'coordination': 'համակարգում',
  'organization': 'կազմակերպում',
  'administration': 'վարչարարություն',
  'governance': 'կառավարում',
  'regulation': 'կարգավորում',
  'legislation': 'օրենսդրություն',
  'jurisdiction': 'իրավասություն',
  'authority': 'իշխանություն',
  'responsibility': 'պատասխանատվություն',
  'obligation': 'պարտավորություն',
  'commitment': 'պարտավորվածություն',
  'dedication': 'նվիրվածություն',
  'devotion': 'նվիրվածություն',
  'loyalty': 'հավատարմություն',
  'allegiance': 'հավատարմություն',
  'fidelity': 'հավատարմություն',
  'trustworthiness': 'վստահելիություն',
  'dependability': 'վստահելիություն',
  'predictability': 'կանխատեսելիություն',
  'consistency': 'հետևողականություն',
  'uniformity': 'միատեսակություն',
  'standardization': 'ստանդարտացում',
  'normalization': 'նորմալացում',
  'regularization': 'կանոնակարգում',
  'systematization': 'համակարգում',
  'rationalization': 'ռացիոնալացում',
  'optimization': 'օպտիմիզացում',
  'maximization': 'առավելագույնացում',
  'minimization': 'նվազագույնացում',
  'prioritization': 'առաջնահերթացում',
  'categorization': 'դասակարգում',
  'classification': 'դասակարգում',
  'identification': 'նույնականացում',
  'recognition': 'ճանաչում',
  'acknowledgment': 'ճանաչում',
  'appreciation': 'գնահատում',
  'evaluation': 'գնահատում',
  'assessment': 'գնահատում',
  'analysis': 'վերլուծություն',
  'examination': 'քննություն',
  'investigation': 'հետաքննություն',
  'exploration': 'հետազոտություն',
  'research': 'հետազոտություն',
  'study': 'ուսումնասիրություն',
  'observation': 'դիտարկում',
  'monitoring': 'մոնիտորինգ',
  'surveillance': 'հսկողություն',
  'supervision': 'հսկողություն',
  'oversight': 'հսկողություն',
  'guidance': 'ուղղորդում',
  'direction': 'ուղղություն',
  'instruction': 'հրահանգ',
  'education': 'կրթություն',
  'training': 'վերապատրաստում',
  'development': 'զարգացում',
  'improvement': 'բարելավում',
  'enhancement': 'բարելավում',
  'refinement': 'բարելավում',
  'perfection': 'կատարելություն',
  'excellence': 'գերազանցություն',
  'superiority': 'գերազանցություն',
  'advantage': 'առավելություն',
  'benefit': 'օգուտ',
  'profit': 'շահույթ',
  'gain': 'շահույթ',
  'success': 'հաջողություն',
  'achievement': 'ձեռքբերում',
  'accomplishment': 'ձեռքբերում',
  'attainment': 'ձեռքբերում',
  'realization': 'իրականացում',
  'fulfillment': 'իրականացում',
  'satisfaction': 'գոհունակություն',
  'contentment': 'գոհունակություն',
  'happiness': 'երջանկություն',
  'joy': 'ուրախություն',
  'pleasure': 'հաճույք',
  'delight': 'ուրախություն',
  'enjoyment': 'վայելում',
  'entertainment': 'ժամանց',
  'amusement': 'ժամանց',
  'recreation': 'ժամանց',
  'relaxation': 'հանգստություն',
  'comfort': 'հարմարավետություն',
  'convenience': 'հարմարություն',
  'luxury': 'շքեղություն',
  'elegance': 'նրբություն',
  'sophistication': 'բարդություն',
  'refinement': 'նրբություն',
  'cultivation': 'մշակում',
  'civilization': 'քաղաքակրթություն',
  'culture': 'մշակույթ',
  'tradition': 'ավանդույթ',
  'heritage': 'ժառանգություն',
  'legacy': 'ժառանգություն',
  'inheritance': 'ժառանգություն',
  'succession': 'հաջորդականություն',
  'continuity': 'շարունակականություն',
  'persistence': 'կայունություն',
  'endurance': 'դիմացկունություն',
  'resilience': 'դիմացկունություն',
  'strength': 'ուժ',
  'power': 'ուժ',
  'energy': 'էներգիա',
  'vitality': 'կենսունակություն',
  'vigor': 'կենսունակություն',
  'enthusiasm': 'ոգևորություն',
  'passion': 'կիրք',
  'zeal': 'կիրք',
  'fervor': 'կիրք',
  'ardor': 'կիրք',
  'intensity': 'ինտենսիվություն',
  'magnitude': 'մեծություն',
  'scale': 'մասշտաব',
  'scope': 'շրջանակ',
  'range': 'շրջանակ',
  'extent': 'չափ',
  'degree': 'աստիճան',
  'level': 'մակարդակ',
  'standard': 'ստանդարտ',
  'quality': 'որակ',
  'excellence': 'գերազանցություն',
  'perfection': 'կատարելություն',
  'flawlessness': 'անթերություն',
  'impeccability': 'անթերություն',
  'precision': 'ճշգրտություն',
  'accuracy': 'ճշգրտություն',
  'correctness': 'ճշտություն',
  'validity': 'վավերություն',
  'legitimacy': 'օրինականություն',
  'authenticity': 'իսկականություն',
  'genuineness': 'իսկականություն',
  'sincerity': 'անկեղծություն',
  'honesty': 'ազնվություն',
  'truthfulness': 'ճշմարտասիրություն',
  'integrity': 'ամբողջականություն',
  'morality': 'բարոյականություն',
  'ethics': 'էթիկա',
  'principles': 'սկզբունքներ',
  'values': 'արժեքներ',
  'beliefs': 'հավատալիքներ',
  'convictions': 'համոզմունքներ',
  'opinions': 'կարծիքներ',
  'perspectives': 'տեսակետներ',
  'viewpoints': 'տեսակետներ',
  'attitudes': 'վերաբերմունք',
  'approaches': 'մոտեցումներ',
  'methods': 'մեթոդներ',
  'techniques': 'տեխնիկաներ',
  'procedures': 'ընթացակարգեր',
  'processes': 'գործընթացներ',
  'systems': 'համակարգեր',
  'mechanisms': 'մեխանիզմներ',
  'structures': 'կառուցվածքներ',
  'frameworks': 'շրջանակներ',
  'models': 'մոդելներ',
  'patterns': 'օրինակներ',
  'templates': 'ձևանմուշներ',
  'formats': 'ձևաչափեր',
  'layouts': 'դասավորություններ',
  'designs': 'դիզայններ',
  'plans': 'պլաններ',
  'schemes': 'սխեմաներ',
  'strategies': 'ռազմավարություններ',
  'tactics': 'մարտավարություններ',
  'approaches': 'մոտեցումներ',
  'solutions': 'լուծումներ',
  'answers': 'պատասխաններ',
  'responses': 'պատասխաններ',
  'reactions': 'ռեակցիաներ',
  'feedback': 'հետադարձ կապ',
  'input': 'մուտք',
  'output': 'ելք',
  'outcome': 'արդյունք',
  'result': 'արդյունք',
  'consequence': 'հետևանք',
  'effect': 'ազդեցություն',
  'impact': 'ազդեցություն',
  'influence': 'ազդեցություն',
  'significance': 'նշանակություն',
  'importance': 'կարևորություն',
  'relevance': 'համապատասխանություն',
  'applicability': 'կիրառելիություն',
  'utility': 'օգտակարություն',
  'usefulness': 'օգտակարություն',
  'effectiveness': 'արդյունավետություն',
  'efficiency': 'արդյունավետություն',
  'productivity': 'արտադրողականություն',
  'performance': 'կատարողականություն',
  'capability': 'ունակություն',
  'capacity': 'ունակություն',
  'potential': 'ներուժ',
  'possibility': 'հնարավորություն',
  'probability': 'հավանականություն',
  'likelihood': 'հավանականություն',
  'chance': 'հնարավորություն',
  'opportunity': 'հնարավորություն',
  'prospect': 'հեռանկար',
  'future': 'ապագա',
  'destiny': 'ճակատագիր',
  'fate': 'ճակատագիր',
  'fortune': 'բախտ',
  'luck': 'բախտ',
  'serendipity': 'բարեպատահ հանդիպում'
};

// Simple lemmatization for common word forms
function lemmatize(word: string): string {
  const lower = word.toLowerCase();
  
  // Handle common suffixes
  if (lower.endsWith('ing') && lower.length > 4) {
    const base = lower.slice(0, -3);
    // Handle doubling (running -> run)
    if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
      return base.slice(0, -1);
    }
    return base;
  }
  
  if (lower.endsWith('ed') && lower.length > 3) {
    return lower.slice(0, -2);
  }
  
  if (lower.endsWith('s') && lower.length > 2 && !lower.endsWith('ss')) {
    return lower.slice(0, -1);
  }
  
  if (lower.endsWith('ly') && lower.length > 3) {
    return lower.slice(0, -2);
  }
  
  return lower;
}

// Calculate word difficulty/usefulness score
function getWordScore(word: string): number {
  const lower = word.toLowerCase();
  
  // Filter out very common words
  if (COMMON_WORDS.has(lower)) return 0;
  
  // Prefer longer words (usually more advanced)
  let score = word.length;
  
  // Boost score for words with known Armenian translations
  if (ARMENIAN_TRANSLATIONS[lower]) {
    score += 15; // Higher boost for words with translations
  }
  
  // Boost score for words with certain patterns that indicate complexity
  if (lower.includes('tion') || lower.includes('sion') || lower.includes('ment') || 
      lower.includes('ness') || lower.includes('ity') || lower.includes('ous') ||
      lower.includes('ful') || lower.includes('less') || lower.includes('able') ||
      lower.includes('ive') || lower.includes('ary') || lower.includes('ory')) {
    score += 8;
  }
  
  // Penalize very short words
  if (word.length < 4) {
    score -= 5;
  }
  
  return score;
}

// Extract context from input (≤100 characters)
function extractContext(input: string): string {
  // Look for common context patterns
  const patterns = [
    /from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /in\s+(?:a\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /on\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /(Medium)\s+article/i,
    /(Guardian)\s+article/i,
    /(article)/i,
    /(book)/i,
    /(news)/i,
    /(blog)/i,
    /(website)/i,
    /(app)/i,
    /(Medium)/i,
    /(Guardian)/i,
    /(Times)/i,
    /(Post)/i,
    /(BBC)/i,
    /(CNN)/i
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      const context = match[1] || match[0];
      return context.length > 100 ? context.substring(0, 97) + '...' : context;
    }
  }
  
  // Fallback: use first 100 characters
  return input.length > 100 ? input.substring(0, 97) + '...' : input;
}

/**
 * Extract useful English vocabulary words from input text
 * Returns JSON in the exact format specified
 */
export function extractVocabulary(input: string): ExtractionResult {
  if (!input || typeof input !== 'string') {
    return { words: [] };
  }
  
  // Extract words using regex (letters and hyphens only)
  const wordMatches = input.match(/[a-zA-Z]+(?:-[a-zA-Z]+)*/g);
  
  if (!wordMatches) {
    return { words: [] };
  }
  
  // Process and score words
  const wordScores: Array<{ word: string; score: number; lemma: string }> = [];
  const seenWords = new Set<string>();
  
  for (const word of wordMatches) {
    if (word.length < 3) continue; // Skip very short words
    
    const lemma = lemmatize(word);
    
    // Skip if we've already seen this lemma
    if (seenWords.has(lemma)) continue;
    seenWords.add(lemma);
    
    const score = getWordScore(word);
    if (score > 0) {
      wordScores.push({ word, score, lemma });
    }
  }
  
  // Sort by score (highest first) and take top 3
  wordScores.sort((a, b) => b.score - a.score);
  const topWords = wordScores.slice(0, 3);
  
  // If no useful words found, return empty array
  if (topWords.length === 0) {
    return { words: [] };
  }
  
  // Extract context
  const context = extractContext(input);
  
  // Build result with exact schema
  const extractedWords: ExtractedWord[] = topWords.map(({ lemma }) => ({
    word: lemma,
    translation: ARMENIAN_TRANSLATIONS[lemma] || '',
    context: context
  }));
  
  return { words: extractedWords };
}

// Test function for development
export function testExtractor() {
  const examples = [
    "I found the word ubiquitous in a Medium article.",
    "Please add serendipity from Guardian.",
    "The sophisticated algorithm demonstrates remarkable efficiency.",
    "This is just hello and cat.",
    ""
  ];
  
  examples.forEach(example => {
    console.log(`Input: "${example}"`);
    console.log(`Output: ${JSON.stringify(extractVocabulary(example))}`);
    console.log('---');
  });
}