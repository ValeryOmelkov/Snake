class Game {
    protected _canvas: any;
    protected _ctx: any;
    protected _startBtn: HTMLButtonElement;
    protected _pauseBtn: HTMLButtonElement;
    protected _restartBtn: HTMLButtonElement;

    protected _jsonDiv: HTMLElement;

    protected _MaxLengthA: HTMLElement;
    protected _LengthA: HTMLElement;
    protected _CountGameA: HTMLElement;
    protected _LifeA: HTMLElement;
    protected _MaxLengthNN: HTMLElement;
    protected _LengthNN: HTMLElement;
    protected _CountGameNN: HTMLElement;
    protected _LifeNN: HTMLElement;
    protected _isNet: boolean = false;

    protected _snake: Snake;
    protected _fruit: Point;
    
    protected _sizeX: number = 20;
    protected _sizeY: number = 20;
    protected _sizeCell: number = 30;
    protected _speed: number = 50;

    protected _countGame: number = 1;
    protected _maxLength: number = 0;
    protected _life: number = 10;

    protected _isStarted: boolean = false;
    protected _processInterval: number;

    // 200 000 | 20х20
    // 500 000 | 20х20

    protected _net: any;
    protected _steps: number = 0;
    protected _stepsNeeded: number = 1000; // Шагов перед обучением
    protected _trainData: Array<Train> = []; // Обучающая выборка
    
    constructor() {
        this._canvas = document.getElementById('canvas');
        this._canvas.width = this._sizeX * this._sizeCell;
        this._canvas.height = this._sizeY * this._sizeCell; 
        this._canvas.style.width = this._sizeX * this._sizeCell + 'px';
        this._canvas.style.height = this._sizeY * this._sizeCell + 'px';
        this._ctx = this._canvas.getContext('2d');

        this._startBtn = document.getElementById('start') as HTMLButtonElement;
        this._startBtn.addEventListener('click', this._startGame.bind(this));
        
        this._pauseBtn = document.getElementById('pause') as HTMLButtonElement;
        this._pauseBtn.addEventListener('click', this._pause.bind(this));
        
        this._restartBtn = document.getElementById('restart') as HTMLButtonElement;
        this._restartBtn.addEventListener('click', this._restart.bind(this));

        this._MaxLengthA = document.getElementById('MaxLengthA');
        this._LengthA = document.getElementById('LengthA');
        this._CountGameA = document.getElementById('CountGameA');
        this._LifeA = document.getElementById('LifeA');
        this._MaxLengthNN = document.getElementById('MaxLengthNN');
        this._LengthNN = document.getElementById('LengthNN');
        this._CountGameNN = document.getElementById('CountGameNN');
        this._LifeNN = document.getElementById('LifeNN');

        // Сеть в формате json, не смог найти варианта получше
        this._jsonDiv = document.getElementById('json');
        const NN200k: any = '{"layers":[{"0":{},"1":{},"2":{},"3":{},"4":{},"5":{},"6":{},"7":{},"8":{},"9":{},"10":{},"11":{},"12":{},"13":{},"14":{},"15":{},"16":{},"17":{},"18":{},"19":{},"20":{},"21":{},"22":{},"23":{}},{"0":{"bias":-3.652800460982222,"weights":{"0":-2.2345802076682046,"1":4.222237969845532,"2":0.05368827442650437,"3":-4.9150335494336765,"4":-1.109005836019049,"5":0.6921246455827331,"6":1.9437984796308412,"7":-0.04065484548239749,"8":4.230380284451139,"9":0.3155258783783038,"10":0.04747222559355301,"11":2.712584655583628,"12":-5.654124637149933,"13":1.2456045081722147,"14":1.8372159412610791,"15":-2.074974140999593,"16":-6.696808176170625,"17":0.46512173934903606,"18":0.09295730726068341,"19":0.034420398191113616,"20":9.962697400194433,"21":-0.8178469347035325,"22":-2.3638535655573447,"23":-0.32497603326586366}},"1":{"bias":1.490460473533029,"weights":{"0":4.401179591268277,"1":-0.37293312415909124,"2":2.3069257875832103,"3":0.47166770406300224,"4":-1.9320686995643102,"5":-5.322845589716331,"6":-5.52214240254321,"7":-3.46241162907849,"8":1.909332661310615,"9":2.0270673992959205,"10":-0.2489726677711928,"11":-0.6110095395748106,"12":-1.2701525507737916,"13":-7.297924878996986,"14":-2.436256789411525,"15":-2.2965047831938974,"16":-1.889206078027831,"17":0.1185989802773208,"18":-0.08461033596699902,"19":0.5414023401407722,"20":-8.412258587669346,"21":1.1348801836768287,"22":8.579813814309931,"23":0.186098548241173}},"2":{"bias":0.6601498873447941,"weights":{"0":-0.9475123613741403,"1":-4.584408919239011,"2":0.8681749642382595,"3":3.9089626397118056,"4":-0.019783810642622083,"5":1.1260851076300893,"6":-0.3367641973927355,"7":-2.3369604833437934,"8":-1.1104358351816916,"9":-2.9406353552030358,"10":2.067761986582321,"11":1.800221358016214,"12":5.650944424282188,"13":-4.792227054647714,"14":-1.2988242444838385,"15":1.5011725321898834,"16":8.522934412650807,"17":-0.4592507330483385,"18":0.004722320036570693,"19":-0.3522839731441479,"20":-6.9049905521036745,"21":1.086808626869347,"22":3.6481181199531063,"23":0.7681654990425292}},"3":{"bias":-0.82281988841531,"weights":{"0":3.0024343049438897,"1":1.9943129849943029,"2":-0.8639834485324348,"3":-2.185291193366508,"4":-2.2751174955412585,"5":-1.129503301646453,"6":2.0794183952542658,"7":-0.187742674063207,"8":-6.9860497589056365,"9":2.9882197001769866,"10":-1.1820463846421778,"11":1.5658800995679822,"12":1.6028638606848933,"13":-1.2060873619110775,"14":0.297350159631811,"15":-7.451506059400288,"16":-5.770963547366319,"17":0.2883244219288916,"18":-0.19383086008435335,"19":1.0415542511172113,"20":-1.2791167030979869,"21":0.4420566432481233,"22":5.561378756692209,"23":-0.799555397649138}},"4":{"bias":0.3665516079832435,"weights":{"0":-0.024836125027846687,"1":5.27047268665646,"2":-0.8216958986383285,"3":-3.9263374940185067,"4":2.0998283859913176,"5":1.5817680312974984,"6":-3.98338793425443,"7":-1.1831822676286272,"8":-4.266491328460439,"9":5.4514163309076835,"10":-3.9827348900426287,"11":-1.2161466976092088,"12":1.4658438457578415,"13":-2.5459363555492835,"14":-2.1788045212504397,"15":0.8324834076773082,"16":8.297149524100902,"17":-0.1092050022614997,"18":0.0560690976019555,"19":-1.2663078453346213,"20":11.890169098294963,"21":-1.8168586988529556,"22":-7.3153303031386345,"23":1.0201714561337338}},"5":{"bias":1.7224834541458327,"weights":{"0":-5.375236063953147,"1":-3.866809789773635,"2":0.6659183570784658,"3":2.1504109543311616,"4":-0.9982082337349524,"5":0.7070218674963047,"6":4.869716718735225,"7":-1.008371486385394,"8":2.728241329069747,"9":0.1201982118742617,"10":-3.8095019546084874,"11":0.20993589507019478,"12":0.9836090416402481,"13":-0.44378280948348336,"14":-0.6749351115943559,"15":2.155120403890287,"16":-10.199673328071118,"17":0.4143197990103356,"18":-0.17072450809598197,"19":1.553228361370495,"20":2.1377322416347395,"21":0.7592768831367155,"22":-2.028352832885877,"23":-1.4666248678742118}},"6":{"bias":-0.27698908321125487,"weights":{"0":-6.689318438278664,"1":-1.4486324487399047,"2":-3.5076740219672424,"3":2.751131948059952,"4":4.030205354735208,"5":4.350925181412584,"6":-0.30452227442489255,"7":-1.6960673142737015,"8":-9.392405782652812,"9":-2.6112602672512915,"10":0.4102955080172494,"11":1.7655927860100593,"12":1.8227631359549783,"13":1.335852323885416,"14":2.4761353565295052,"15":0.4101025349361818,"16":7.161641533525576,"17":0.020472031569323344,"18":-0.06698716936420795,"19":-0.35025087168590674,"20":-1.542586956112258,"21":-0.40214796711242473,"22":-12.013868475586246,"23":0.7843157530759988}},"7":{"bias":0.6261912378172579,"weights":{"0":0.5442740299297875,"1":1.0875790987319967,"2":-5.816186294698568,"3":-4.574638926837301,"4":3.595630194923815,"5":2.349388978930022,"6":4.223429783919492,"7":-1.9108129429687355,"8":-0.18159204219751773,"9":0.9251847641943027,"10":-5.961770883105827,"11":0.143650816344382,"12":4.354523517326879,"13":-0.1152481445182526,"14":0.19303035179934447,"15":-0.1888282376845781,"16":-7.6959827892648605,"17":0.5267296333555993,"18":0.007181236185640039,"19":2.7262833614524244,"20":-13.642635411250549,"21":-0.0879034502461662,"22":1.2721934899680762,"23":-1.6074844267120703}},"8":{"bias":1.3139583025437926,"weights":{"0":-4.872408220889188,"1":-6.540239141603295,"2":3.9351186396959754,"3":3.0718971676152638,"4":-2.71287573334742,"5":-0.9448772717434053,"6":-0.21991049112218725,"7":-4.310380582198893,"8":5.846587890211826,"9":-3.453759117357882,"10":-0.0845894684896535,"11":-2.192549859890018,"12":-0.313024130398382,"13":0.05197219763800822,"14":-0.8311601879539743,"15":2.8897930788078177,"16":-1.670578693503534,"17":-0.20440131378412355,"18":-0.09227239756711754,"19":-1.3977920779840591,"20":6.753592753661421,"21":0.47597906387977174,"22":6.5145913644520315,"23":0.1382910658039254}},"9":{"bias":0.7126883961689765,"weights":{"0":-0.5320065561758597,"1":0.17382230128286788,"2":-1.0947643190042649,"3":0.2733863660516154,"4":2.6930245199100287,"5":1.180228776723782,"6":-0.9198553345063407,"7":-1.6276557093860067,"8":0.8786517527560184,"9":0.06873246275218661,"10":-2.32886944725142,"11":-4.711714385614424,"12":3.6282501161443075,"13":-1.227045425508726,"14":2.690750630227489,"15":3.3029443893467034,"16":2.763297030704343,"17":0.03893704479231011,"18":0.11931949658330376,"19":0.09895983203930636,"20":-7.3653963120051325,"21":-0.29387454455470224,"22":-1.0710220324365451,"23":0.09157990546841334}},"10":{"bias":-2.0796602248577534,"weights":{"0":1.0083092411329266,"1":-5.179769183808764,"2":2.831203854655276,"3":1.666330863674564,"4":-3.1703314729097296,"5":2.6521824394149656,"6":-1.9947293372259662,"7":2.6905094129947815,"8":1.3805321345702628,"9":-0.5370433177323808,"10":2.0571882981561678,"11":-3.0385054196085224,"12":-0.3066556059545324,"13":2.140370519154946,"14":1.7029600083861642,"15":-0.7432387760806294,"16":15.4519338553405,"17":-0.6975733974716016,"18":-0.011788429560202568,"19":-2.8765088350664922,"20":10.635179893342478,"21":0.31543390954648814,"22":8.579917404359655,"23":3.1087335247802805}},"11":{"bias":2.455991798306597,"weights":{"0":-0.017899056495147576,"1":0.7086325449656866,"2":-1.7059306500317715,"3":-5.712139314307623,"4":-1.509990230511818,"5":-2.9245424057881944,"6":0.6357911261054631,"7":-2.1633156642428704,"8":0.31165755728301753,"9":-1.6345359619942925,"10":-0.6696338665275959,"11":-11.233660766229107,"12":-0.09359898624728202,"13":5.289579058153964,"14":6.1909434476262115,"15":-1.2748435777821916,"16":-6.424295252899943,"17":-0.030060336243503804,"18":0.16627282231250462,"19":0.3864348028404435,"20":5.503251286673148,"21":0.09174077066751808,"22":-2.7671060871710575,"23":-0.7288003081887792}}},{"0":{"bias":0.6064005669041079,"weights":{"0":-5.3805404650693704,"1":-7.514051411659304,"2":6.325292959564812,"3":-8.69994707167693,"4":7.174084148307056,"5":-8.788909277616193,"6":6.534009746444098,"7":-3.6254097699051693,"8":-9.58500877476437,"9":5.6697920886382365,"10":4.490470853551706,"11":-8.165965214666093}},"1":{"bias":-2.6927676686110393,"weights":{"0":0.9936546142099598,"1":2.0181031848982767,"2":-8.242810367898754,"3":-1.6905616014155884,"4":-7.653111257829675,"5":4.419411864820204,"6":4.125443284958236,"7":10.726270382917741,"8":-7.02429481518613,"9":-0.8700712818918219,"10":-19.038310692986414,"11":11.579872971360956}},"2":{"bias":0.7621637289405366,"weights":{"0":7.469814794549486,"1":-9.995396600071958,"2":-7.228020921702935,"3":-1.9696307701523978,"4":6.825674154624358,"5":4.022378760994449,"6":-2.6142651973247504,"7":-12.318881062603134,"8":7.5063509794441385,"9":-10.071410644076924,"10":3.8735611636773144,"11":5.408355962370061}},"3":{"bias":-1.753284297535977,"weights":{"0":-11.531303342738664,"1":8.484465053598448,"2":5.556691913445922,"3":7.594153923987961,"4":-11.82110316611867,"5":-3.5917799353664677,"6":-13.24447027154668,"7":2.641057307418077,"8":2.7974267524450918,"9":1.3131128903431983,"10":1.7298044092652645,"11":-4.634427290289462}}}],"outputLookup":false,"inputLookup":false}';
        const NN500k: any = '{"layers":[{"0":{},"1":{},"2":{},"3":{},"4":{},"5":{},"6":{},"7":{},"8":{},"9":{},"10":{},"11":{},"12":{},"13":{},"14":{},"15":{},"16":{},"17":{},"18":{},"19":{},"20":{},"21":{},"22":{},"23":{}},{"0":{"bias":1.9776040904462204,"weights":{"0":8.85977078368409,"1":-0.8918024063860498,"2":-21.38092885963533,"3":15.931057630562288,"4":-14.389242158108162,"5":-1.7383286030043679,"6":11.430192743234116,"7":-9.126298901904208,"8":18.658135349271454,"9":2.8178245284828685,"10":-13.332530693844298,"11":7.360862668051252,"12":-17.711261549107682,"13":-0.5508470917043374,"14":18.827720148409572,"15":-18.37511692744278,"16":-12.276150954362437,"17":0.9840311785792966,"18":6.632145411711446,"19":39.74724130207542,"20":15.489091224447302,"21":-16.379947293763752,"22":-13.7347036428367,"23":-28.656711578876347}},"1":{"bias":-3.3536097372743274,"weights":{"0":11.523987858422842,"1":-12.84619025096009,"2":51.038650537261965,"3":-22.57259396733693,"4":18.212122712941348,"5":3.0570618236413156,"6":-4.327814158844531,"7":1.9338917803810007,"8":0.5379977991975438,"9":10.148518963465396,"10":6.162000321743587,"11":-3.9206771583264084,"12":1.5696263071314631,"13":-0.7653474982522889,"14":-3.220146522267162,"15":1.904013109222599,"16":79.42993083136771,"17":-15.658679373947946,"18":-18.441775691637627,"19":-13.517281325828,"20":1.0768317286828133,"21":27.557264798188662,"22":23.800287162309427,"23":26.300663552189913}},"2":{"bias":-10.700867575145569,"weights":{"0":68.22801321150048,"1":-68.39022896028355,"2":119.74814420977435,"3":-43.456391328872705,"4":45.820067781425344,"5":4.4044837830156975,"6":-4.129979645772812,"7":0.9784467047688714,"8":0.6338056480645835,"9":0.07222105888789586,"10":3.392035697181915,"11":-2.06034422899458,"12":22.29679236058902,"13":0.9898829806332513,"14":-10.62638609176245,"15":1.9549327884170828,"16":12.874612711454109,"17":-2.7075281442722394,"18":-40.55140140145019,"19":-30.525095979298417,"20":-15.890199467667857,"21":11.211345348099671,"22":7.747045453514566,"23":14.388818475389128}},"3":{"bias":-8.49994617806389,"weights":{"0":6.522317078599797,"1":-1.8648777877608778,"2":4.7843800052736425,"3":-0.35576467918145765,"4":0.12207231193116658,"5":-1.9892677981096862,"6":0.7682980003933082,"7":-4.425892838810359,"8":1.970521527958906,"9":-1.4250925256367135,"10":2.1483332811638363,"11":-4.341234392966568,"12":-108.76825286722793,"13":2.9730790900380417,"14":4.619669338202775,"15":-0.16731876464599824,"16":-23.26667979138074,"17":-5.2153943085801755,"18":-15.981109884938661,"19":-14.128499255458063,"20":178.6245813721861,"21":4.29199558170488,"22":10.253774003417318,"23":0.21896602044302832}},"4":{"bias":-3.096585093946288,"weights":{"0":-3.6278833796783796,"1":1.895889547948548,"2":8.567428305854655,"3":-7.807661048445685,"4":-20.176118760181843,"5":19.496329716448,"6":-22.51430807423635,"7":3.0976562847292026,"8":0.9564224515606341,"9":-1.7706739250556782,"10":2.1348372255196826,"11":-0.5417863346715798,"12":-0.9299048412240503,"13":2.3316544822090752,"14":-79.57971620953882,"15":-3.0463055507310557,"16":-25.954536192927907,"17":-17.639516759637182,"18":-23.6118488142938,"19":-15.368281672869628,"20":-12.42341545053511,"21":44.26436255467027,"22":121.77687028448804,"23":-3.807302068014311}},"5":{"bias":5.06565866820938,"weights":{"0":-9.487204710933643,"1":-58.1785533013107,"2":21.280129881537317,"3":-20.05247868685911,"4":-21.404868160330622,"5":-25.797987222046192,"6":26.98233719806867,"7":-58.64467401965304,"8":5.537138883001913,"9":-26.05888702749909,"10":-4.956947497612076,"11":-2.4043660979080723,"12":8.851120554256442,"13":-3.042696130564904,"14":-4.127983894326328,"15":-1.8995848364188352,"16":-17.11825148458802,"17":8.86787287540308,"18":6.129372308300617,"19":5.429831226813967,"20":-2.1659659868440406,"21":10.480521122049012,"22":8.021411630500447,"23":-7.421788260958929}},"6":{"bias":-9.133788193546685,"weights":{"0":12.338313564624297,"1":-13.913740181709787,"2":21.13001378626524,"3":-7.704169172584957,"4":-21.45770012728141,"5":27.012430206473955,"6":-26.63109431558905,"7":-1.1072485676472164,"8":9.162895683100272,"9":-0.8436456074062019,"10":-5.038372890865553,"11":9.244368218138224,"12":-9.247915682345598,"13":1.5143896092913482,"14":-0.3981658444999221,"15":0.817673553910628,"16":-13.880399781012075,"17":-3.6382856642179795,"18":-10.18964613404717,"19":-7.565366441198268,"20":4.581887603258168,"21":10.406677339667757,"22":1.8253153120611014,"23":-0.24525264161966837}},"7":{"bias":-2.4365591874940846,"weights":{"0":-44.64100987327206,"1":12.118021827968906,"2":-6.039113496786992,"3":-2.551715915674661,"4":5.2660476007537085,"5":-4.41494519221261,"6":-23.270824463637563,"7":27.77539160310962,"8":-45.10938247110982,"9":-3.616500685396359,"10":2.4074170590819652,"11":-3.3762471579774225,"12":3.9422321951522017,"13":0.1924698705860748,"14":0.2411510972445574,"15":2.3169812479777403,"16":90.57285839283774,"17":-16.802382459629694,"18":-10.930275257266164,"19":-9.927227724838673,"20":-26.678335835573627,"21":-4.063497401901504,"22":25.88002840359272,"23":43.63043199349099}},"8":{"bias":37.395861711438364,"weights":{"0":4.402118256641799,"1":-10.188406795194988,"2":-37.53074952658048,"3":-10.564398109710387,"4":5.813134895404111,"5":14.99359991054016,"6":-21.269009983861974,"7":3.0442744861813016,"8":8.258876865395383,"9":2.7285183681867444,"10":-50.88746560631912,"11":-1.2656004229628595,"12":10.619551855508675,"13":-0.0641466022932873,"14":1.3282736377171733,"15":-1.6031188144570165,"16":2.761013412619531,"17":2.15313084464263,"18":1.4102079486825687,"19":3.5384292455641724,"20":-5.121606042490682,"21":-8.924127233271099,"22":-17.590978431144777,"23":9.298258073163781}},"9":{"bias":2.4825877616889422,"weights":{"0":-7.236349473469202,"1":7.30481576019486,"2":-7.698095743828181,"3":-1.2022258382931443,"4":8.113706221965575,"5":-2.77084244569226,"6":2.0284419696410882,"7":0.6635582770857829,"8":-9.856908956974298,"9":7.61414134988627,"10":-8.202926400281683,"11":-0.15618042735637538,"12":6.693339331383453,"13":-3.876013236026836,"14":5.396687836169583,"15":-1.6986712301057427,"16":1.7968888161036178,"17":16.52094849091321,"18":5.105548010202295,"19":0.23032666805646107,"20":-20.188058078890336,"21":-13.871559882081575,"22":-16.0295072650081,"23":0.8167731918261644}},"10":{"bias":12.45986142871684,"weights":{"0":7.1255732233028874,"1":-5.482622619257126,"2":-25.289697854608427,"3":28.957471820768447,"4":-30.295331541535226,"5":4.020432780681364,"6":-0.2868311324865579,"7":-3.351868017797153,"8":-11.963072665344786,"9":-3.763113277917976,"10":-10.56631401354775,"11":15.600720149665559,"12":-3.0132724019817343,"13":14.973502296598852,"14":-11.808671631428394,"15":0.4712119712322684,"16":-7.788702118002425,"17":8.492948239341754,"18":-7.71217143371277,"19":0.9607863961060586,"20":58.78639099978824,"21":2.9100023425800043,"22":-8.736615237696299,"23":-5.395468593258515}},"11":{"bias":2.3145036793287255,"weights":{"0":9.87825324916936,"1":2.067034457769573,"2":-8.034089231149393,"3":1.267502208985344,"4":-9.155980731755076,"5":2.718937868573723,"6":3.9443177566038585,"7":-4.144153045558365,"8":-1.7004606130819775,"9":-0.8326766018118175,"10":-0.023629080402379356,"11":3.2237542974737647,"12":-5.780854119672711,"13":19.37740549423634,"14":0.6887637861237352,"15":6.746840858472135,"16":-39.76799694030762,"17":8.777458521083588,"18":26.211502427285165,"19":15.717662453898887,"20":41.08911340850129,"21":15.938093481850265,"22":35.97644686640262,"23":-18.684794954581168}}},{"0":{"bias":-4.1655105290201595,"weights":{"0":-3.1776440033697204,"1":3.2492479053061043,"2":-0.9874205720746206,"3":-11.618590061552428,"4":-14.375117615847856,"5":-8.359204887117338,"6":-45.079746001672575,"7":6.473074062950309,"8":-2.9274414693791124,"9":4.489712497619033,"10":2.699281840311197,"11":-2.348180741120209}},"1":{"bias":-23.283320812751153,"weights":{"0":2.908076664410413,"1":-3.5297668478306976,"2":-0.266480658119025,"3":-7.569860652909989,"4":-7.82211042305777,"5":3.236219129993761,"6":-2.0901855415635624,"7":-6.068289798859966,"8":22.455827228412865,"9":2.9018019546817575,"10":-1.8539630805533207,"11":1.93691106568431}},"2":{"bias":-5.118009301499581,"weights":{"0":4.168530971480973,"1":3.2122022190350963,"2":-3.0247532954685696,"3":8.606078848394501,"4":-8.986277069648333,"5":0.35814414496952857,"6":3.2040909822302455,"7":-0.7990668459921889,"8":-4.174645651581836,"9":-2.5697851298895764,"10":1.5848299486344153,"11":1.4750026135509817}},"3":{"bias":-2.556093422357109,"weights":{"0":-2.656594786412156,"1":2.5930939139026035,"2":3.424181398726573,"3":-6.060735402277428,"4":11.981738260727358,"5":2.3946788455439254,"6":-2.0397347321239234,"7":-5.280891086301625,"8":1.387865258364517,"9":-5.384684775746029,"10":-1.824762120641605,"11":-0.06803715013341807}}}],"outputLookup":false,"inputLookup":false}'

        const config = {
            inputSize: 24,
            hiddenLayers: [12],
            outputSize: 4,
            activation: 'relu',
            learningRate: 0.1,
        };
        this._net = new brain.NeuralNetwork(config);
        
        this._loadNet(NN500k); // Загрузка сети из json

        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, {x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2)});
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        this._startGame();
    }
    
    protected _startGame() {
        this._pauseBtn.disabled = false;
        this._processInterval = setInterval (() => {
            this.step(this._isNet ? this.NetAction() : this.DFS());
            this._drawField();
            this._drawFruit();
            this._snake.draw();
        }, this._speed);
    }
    
    protected _pause() {
        this._isStarted = false;
        this._pauseBtn.disabled = true;
        clearInterval(this._processInterval);
    }
    
    protected _restart() {
        this._isStarted = false;
        clearInterval(this._processInterval);
        this._pauseBtn.disabled = true;
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, {x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2)});
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        this._startGame();
    }

    protected _drawField(): void {
        for(let y: number = 0; y < this._sizeY; y++) {
            for(let x: number = 0; x < this._sizeX; x++) {
                this._ctx.fillStyle = ((x + (y % 2)) % 2 === 0) ? '#AAAAAA' : '#777777';
                this._ctx.fillRect(x * this._sizeCell, y * this._sizeCell, this._sizeCell, this._sizeCell);
            }
        }
    }
    
    protected _createFruit(): void {
        const snake = [this._snake.head, ...this._snake.body];
        let inSnake: boolean = true;
        let x: number;
        let y: number;
        while(inSnake){
            x = Math.floor(Math.random() * (this._sizeX));
            y = Math.floor(Math.random() * (this._sizeY));
            inSnake = snake.some((item) => item.x === x && item.y === y);
        }
        this._fruit = {x, y};
    }
    
    protected _drawFruit(): void {
        this._ctx.fillStyle = '#AA0000';
        this._ctx.fillRect(this._fruit.x * this._sizeCell, this._fruit.y * this._sizeCell, this._sizeCell, this._sizeCell);
    }

    protected _getState(): Array<number>{
        const head: Point = this._snake.head;
        let wallState: Array<number> = []; // Значения от 0 до 1
        let bodyState: Array<number> = new Array(8).fill(0); // Значения от 0 до 1 | 0 при отсутствии в поле видимости
        let foodState: Array<number> = new Array(8).fill(0); // Значения от 0 до 1 | 0 при отсутствии в поле видимости
        // Стенки
        wallState.push(head.y);                                               // Вверх
        wallState.push(Math.min(this._sizeX - head.x, head.y));               // Вверх-вправо
        wallState.push(this._sizeX - head.x);                                 // Вправо
        wallState.push(Math.min(this._sizeX - head.x, this._sizeY - head.y)); // Вниз-вправо 
        wallState.push(this._sizeY - head.y);                                 // Вниз
        wallState.push(Math.min(head.x, this._sizeY - head.y));               // Вниз-влево
        wallState.push(head.x);                                               // Влево
        wallState.push(Math.min(head.x, head.y));                             // Вверх-влево
        wallState = wallState.map((n) => {return n!= 0 ? Number((1/n).toFixed(2)) : 0}); // Нормализация от 0 до 1
        // Тело
        let mpX: number; // Множитель для X
        let mpY: number; // Множитель для Y
        for(let i = 0; i < 8; i++){
            mpX = (i > 4) ? -1 : ((i < 4 && i > 0) ? 1 : 0);
            mpY = (i > 2 && i < 6) ? 1 : ((i > 6 || i < 2) ? -1 : 0);
            let distance: number = 1;
            while(!(head.x + (distance * mpX) < 0 || head.x + (distance * mpX) >= this._sizeX || head.y + (distance * mpY) < 0 || head.y + (distance * mpY) >= this._sizeY)){
                if (this._snake.body.filter((item) => item.x === head.x + (distance * mpX) && item.y === head.y + (distance * mpY)).length > 0){
                    bodyState[i] = distance;
                    break;
                }
                distance++;
            }
        }
        bodyState = bodyState.map((n) => {return n != 0 ? Number((1/n).toFixed(2)) : 0})
        // Еда
        if (head.x === this._fruit.x){ // Верх/Низ
            head.y > this._fruit.y ? foodState[0] = head.y - this._fruit.y : foodState[4] = this._fruit.y - head.y;
        } else if (head.y === this._fruit.y){ // Лево/Право
            head.x > this._fruit.x ? foodState[6] = head.x - this._fruit.x : foodState[2] = this._fruit.x - head.x;
        } else if (head.x - this._fruit.x === head.y - this._fruit.y){ // Диагональ с лева направо, сверху вниз
            head.x > this._fruit.x ? foodState[7] = Math.abs(head.x - this._fruit.x) : foodState[3] = Math.abs(head.x - this._fruit.x);
        } else if (Math.abs(head.x - this._fruit.x) === Math.abs(head.y - this._fruit.y)){ // Диагональ с лева направо, снизу вверх
            head.x > this._fruit.x ? foodState[5] = Math.abs(head.x - this._fruit.x) : foodState[1] = Math.abs(head.x - this._fruit.x);
        }
        foodState = foodState.map((n) => {return n != 0 ? Number((1/n).toFixed(2)) : 0}); // Нормализация от 0 до 1

        return [...wallState, ...bodyState, ...foodState];
    }
    
    public step(action: Array<number>): void {
        console.log(this._steps);
        this._setTextDivBlock();
        
        if (this._steps < this._stepsNeeded){
            this._setTrainData(this._getState(), this.DFS());
        }
        this._steps++;
        this._life--;
        if(this._steps % 1000 === 0){
            this.NetTrain();
            this._trainData = [];
        }
        const max = Math.max.apply(null, action);
        let indexMax = action.indexOf(max);
        if(indexMax === -1) indexMax = 0;
        this._snake.direction = Math.abs(this._snake.direction - indexMax) === 2 ? this._snake.direction : indexMax;
        const head: Point = {...this._snake.head};

        switch(this._snake.direction) {
            case Direction.Up: 
                head.y--; 
                break;
            case Direction.Down: 
                head.y++; 
                break;
            case Direction.Right: 
                head.x++;
                break;
            case Direction.Left: 
                head.x--;
                break;
        }

        if (!this._checkIsAlive(head)) {
            this._endGame();
            return;
        }

        if(this._life <= 0){
            this._endGame();
            return;
        }
        
        let growing: boolean = false;
        if (this._checkFruit(head)) {
            this._createFruit();
            this._drawFruit();
            this._life = 500;
            growing = true;
        }

        this._snake.move(growing);
    }

    protected _setTextDivBlock(): void{
        if(this._isNet){
            if (this._snake.body.length + 1 > this._maxLength) {
                this._maxLength = this._snake.body.length + 1;
                this._MaxLengthNN.textContent = this._maxLength.toString();
            }
            this._LengthNN.textContent = (this._snake.body.length + 1).toString();
            this._CountGameNN.textContent = this._countGame.toString();
            this._LifeNN.textContent = this._life.toString();
        } else {
            if (this._snake.body.length + 1 > this._maxLength) {
                this._maxLength = this._snake.body.length + 1;
                this._MaxLengthA.textContent = this._maxLength.toString();
            }
            this._LengthA.textContent = (this._snake.body.length + 1).toString();
            this._CountGameA.textContent = this._countGame.toString();
            this._LifeA.textContent = this._life.toString();
        }
    }

    // Получение действия от сети
    protected NetAction(): Array<number>{
        const action = this._net.run(this._getState());
        console.log(action);
        return action;
    }
    // Сбор данных
    protected _setTrainData(inp: Array<number>, out: Array<number>): void{
        this._trainData.push({input: inp, output: out});
    }
    // Обучение сети
    protected NetTrain(): void{
        this._pause();
        console.log('Обучение...')
        this._net.train(this._trainData, 
            {
                log: true, 
                logPeriod: 100, 
                errorThresh: 0.005, 
                iterations: 5000, 
                timeout: Infinity, 
                learningRate: 0.2,
            }
        );
        console.log('Обучилось!');
        this._saveNet();
        this._isNet = true;
        this._maxLength = 0;
        this._countGame = 1;
        this._restart();
    }
    // Сохранение сети
    protected _saveNet(): void{
        const json = JSON.stringify(this._net.toJSON());
        this._jsonDiv.innerHTML = json;
    }
    // Загрузка сети
    protected _loadNet(jsonFile): void{
        jsonFile = JSON.parse(jsonFile);
        this._net.fromJSON(jsonFile);
        this._isNet = true;
    }

    protected DFS(): Array<number>{
        const fruit: Point = this._fruit;
        const head: Point = this._snake.head;
        let field: Array<Array<number>> = new Array(this._sizeY); 
        for(let i = 0; i < field.length; i++){
            field[i] = new Array(this._sizeX).fill(100);
        }
        field[fruit.y][fruit.x] = 80;        
        field[head.y][head.x] = 0;
        for(let item of this._snake.body){
            field[item.y][item.x] = 150;
        }

        let mainArray: Array<Point> = [head];
        let assistArray: Array<Point> = [];
        let findFood: boolean = false;
        const offset: Array<number> = [-1, 1, 1, -1];
        let num: number = 1;
        let offY: number;
        let offX: number;
        while(!findFood){
            assistArray = mainArray;
            mainArray = [];
            for(let item of assistArray){
                for(let i = 0; i < 4; i++){ 
                    offY = (i % 2 === 0) ? offset[i] : 0;
                    offX = (i % 2 === 0) ? 0 : offset[i];
                    if((item.y + offY || item.x + offX) < 0 || (item.y + offY >= this._sizeY || item.x + offX >= this._sizeX)){
                        continue;
                    }
                    if(field[item.y + offY][item.x + offX] === 150){
                        continue;
                    }
                    if (field[item.y + offY][item.x + offX] === 100 && field[item.y + offY][item.x + offX] != 0 || field[item.y + offY][item.x + offX] === 80) {
                        if (item.y + offY === fruit.y && item.x + offX === fruit.x) {
                            findFood = true;
                        }
                        field[item.y + offY][item.x + offX] = num;
                        let x = item.x + offX;
                        let y = item.y + offY;
                        mainArray.push({x, y} as Point);
                    }
                }
            }
            num++;
            if(num > (this._sizeY*3)) break;
        }

        let currentPoint: Point = fruit;
        const way: Array<Point> = [fruit];
        let findWay: boolean = false;
        while(!(currentPoint.x === head.x && currentPoint.y === head.y)){
            let countWay: number = 0;
            for(let i = 0; i < 4; i++){
                offY = (i % 2 === 0) ? offset[i] : 0;
                offX = (i % 2 === 0) ? 0 : offset[i];
                const item: Point = {x:(currentPoint.x + offX), y:(currentPoint.y + offY)};
                if(item.x < 0 || item.y < 0 || item.x >= this._sizeX || item.y >= this._sizeY){
                    continue;
                }
                if(field[item.y][item.x] < field[currentPoint.y][currentPoint.x]){
                    way.push(item);
                    currentPoint = item;
                    findWay = true;
                    countWay++;
                    break;
                }
            }
            if(countWay === 0) {
                findWay = false;
                break;
            }
        }
        way.pop();

        let nearestPoint: Point;
        let dirX: number;
        let dirY: number;
        if (findWay){
            nearestPoint = way.pop();
            dirX = nearestPoint.x - head.x;
            dirY = nearestPoint.y - head.y;
        } else {
            for(let i = 0; i < 4; i++){
                offY = (i % 2 === 0) ? offset[i] : 0;
                offX = (i % 2 === 0) ? 0 : offset[i];
                const item: Point = {x:(head.x + offX), y:(head.y + offY)};
                if(item.x < 0 || item.y < 0 || item.x >= this._sizeX || item.y >= this._sizeY){
                    continue;
                }
                if(field[item.y][item.x] > field[head.y][head.x] && field[item.y][item.x] < 100){
                    dirX = item.x - head.x;
                    dirY = item.y - head.y;
                    break;
                }
            }
        }
    
        if (dirX === 0 && dirY === -1) return [1, 0, 0, 0];
        else if (dirX === 1 && dirY === 0) return [0, 1, 0, 0];
        else if (dirX === 0 && dirY === 1) return [0, 0, 1, 0];
        else return [0, 0, 0, 1];
    }
    
    protected _checkFruit(head: Point): boolean {
        if (head.x === this._fruit.x && head.y === this._fruit.y) {
            return true;
        }
        return false;
    }
    
    protected _checkIsAlive(head: Point): boolean {
        // Проверка на столкновение со стеной
        if ((head.x < 0) || (head.x >= this._sizeX) || (head.y < 0) || (head.y >= this._sizeY)) {
            return false;
        }
        // Проверка на столкновение с туловищем
        for(const item of this._snake.body) {
            if(item.x === head.x && item.y === head.y){
                return false;
            }
        }
        
        return true;
    }
    
    protected _endGame(): void {
        this._life = 500;
        this._countGame++;
        this._snake = new Snake(this._ctx, this._sizeCell, {x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2)});
        this._drawField();
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        this._pauseBtn.disabled = true;
        console.log('Поражение!');
    }
}

class Snake {
    protected _ctx: any;
    protected _sizeCell: number;
    public head: Point;
    public body: Point[] = [];
    public direction: Direction = Direction.Up;
    
    constructor(context: any, size: number, startPoint: Point) {
        this._ctx = context;
        this._sizeCell = size;
        this.head = startPoint;
        this.body.push({x:this.head.x, y:(this.head.y + 1)}, {x:this.head.x, y:(this.head.y + 2)})
    }
    
    public draw() {
        this._ctx.fillStyle = '#008800';
        this._ctx.fillRect(this.head.x * this._sizeCell, this.head.y * this._sizeCell, this._sizeCell, this._sizeCell);
        for(let i: number = 0; i < this.body.length; i++) {
            this._ctx.fillStyle = '#008800';
            this._ctx.fillRect(this.body[i].x * this._sizeCell, this.body[i].y * this._sizeCell, this._sizeCell, this._sizeCell);
            this._ctx.fillStyle = '#00BB00';
            this._ctx.fillRect(this.body[i].x * this._sizeCell + 2, this.body[i].y * this._sizeCell + 2, this._sizeCell - 4, this._sizeCell - 4);
        }
    }
    
    public move(growing: boolean) {
        const oldHead = {...this.head};
        this.body.unshift(oldHead);
        if (!growing) this.body.pop();
        
        switch(this.direction) {
            case Direction.Up: 
                this.head.y--; 
                break;
            case Direction.Down: 
                this.head.y++; 
                break;
            case Direction.Right: 
                this.head.x++; 
                break;
            case Direction.Left: 
                this.head.x--; 
                break;
        }
    }

    public randomAction(): Array<number>{
        const random: number = Math.random();
        if (random < 0.25) return [1, 0, 0, 0];
        if (random < 0.5) return [0, 1, 0, 0];
        if (random < 0.75) return [0, 0, 1, 0];
        return [0, 0, 0, 1];
    }
}

interface Point {
    x: number;
    y: number;
}

enum Direction {
    Up = 0,
    Right = 1,
    Down = 2,
    Left = 3
}

interface Train {
    input: Array<number>;
    output: Array<number>;
}

const game = new Game;