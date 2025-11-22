import type { TranslationKey } from '../types';

export const ua: TranslationKey = {
    // Загальне
    appName: 'Clink',
    loading: 'Триває завантаження…',
    skip: 'Пропустити',
    tapToContinue: 'Натисніть, щоб продовжити',

    // Історії онбордингу
    onboarding: {
        welcome: {
            title: 'Ласкаво просимо до Clink',
            subtitle: 'Безкоштовний напій',
            description: 'Приєднуйтесь та отримайте безкоштовний напій — перший ковток атмосфери Clink.',
        },
        topUp: {
            title: 'Поповнення за секунди',
            subtitle: 'На касі',
            description: 'Поповнюйте баланс на будь‑якій касі — швидко, безпечно та саме тоді, коли потрібно.',
        },
        getDrink: {
            title: 'Замовляйте та смакуйте',
            subtitle: 'Заберіть у барі',
            description: 'Замовляйте в барі й насолоджуйтеся улюбленими напоями — швидкий сервіс і відмінний смак.',
        },
        progress: 'Крок {current} з {total}',
    },

    // Головна сторінка
    home: {
        title: 'Clink',
        subtitle: 'Додаток для замовлення напоїв',
        buttons: {
            orderDrinks: 'Замовити напої',
            topUpBalance: 'Поповнити баланс',
            myAccount: 'Мій акаунт',
        },
    },

    // Обмеження мобільною версією
    mobileOnly: {
        title: 'Створено для мобільних',
        description: 'Clink оптимізовано для смартфонів і планшетів, щоб забезпечити найкращий досвід.',
        instruction: 'Відкрийте на телефоні чи планшеті',
    },

    // Встановлення PWA
    pwa: {
        install: {
            title: 'Встановити Clink',
            description: 'для кращого досвіду',
            button: 'Встановити',
            dismiss: 'Не зараз',
            howTo: 'Як встановити',
        },
        ios: {
            title: 'Встановити Clink',
            step1: {
                title: 'Натисніть «Поділитися»',
                description: 'У Safari торкніться кнопки «Поділитися» внизу екрана',
            },
            step2: {
                title: 'Додайте на «Дім»',
                description: 'Прокрутіть та оберіть «Додати на домашній екран»',
            },
            step3: {
                title: 'Підтвердьте',
                description: 'Натисніть «Додати» у правому верхньому куті',
            },
        },
        status: {
            installing: 'Встановлення…',
            installed: 'Clink готовий!',
            failed: 'Помилка встановлення. Спробуйте ще раз.',
            unsupported: 'Цей браузер не підтримує встановлення.',
        },
    },

    // Платіжний процес
    payment: {
        balance: 'Ваш баланс',
        available: 'Доступно:',
        amountExceeds: 'Сума перевищує ваш баланс.',
        payAmount: 'Сплатити',
        slideToPay: 'Проведіть праворуч, щоб оплатити',
        to: 'Кому:',
        success: 'Платіж надіслано!',
        receiver: 'Одержувач',
        sender: 'Відправник',
        date: 'Дата',
        transactionFailed: 'Транзакція не вдалася',
        scanFailed: 'Не вдалося відсканувати QR‑код. Спробуйте ще раз.',
        error: {
            default: 'Платіж не пройшов',
            insufficient: 'Недостатньо коштів',
            timeout: 'Час очікування вичерпано',
            tag: 'Тег користувача не знайдено',
            unknown: 'Неочікувана помилка',
        },
        qr: {
            invalidAddress: 'Недійсна адреса',
            invalidAddressDescription: 'Відскануйте дійсну EVM‑адресу.',
            ownAddress: 'Неможливо оплатити себе',
            ownAddressDescription: 'Ви не можете надіслати гроші на власну адресу.',
            ownUserTag: 'Неможливо оплатити себе',
            ownUserTagDescription: 'Ви не можете надіслати гроші на власний тег.',
            invalidUserTag: 'Недійсний тег користувача',
            invalidUserTagDescription: 'Відскануйте коректний тег користувача.',
            invalidQrCode: 'Недійсний QR‑код',
            invalidQrCodeDescription: 'Відскануйте коректний QR‑код гаманця або тег.',
            scanInstruction: 'Розташуйте QR‑код у рамці.',
            loadingUserInfo: 'Завантажуємо інформацію…',
            manualEntry: 'Ввести вручну',
            backToScan: 'Сканувати QR‑код',
        },
        manual: {
            title: 'Введіть тег користувача',
            subtitle: 'Тег одержувача',
            inputLabel: 'Тег користувача',
            inputPlaceholder: 'Тег користувача',
            pasteButton: 'Вставити',
            pasting: 'Вставлення…',
            continueButton: 'Продовжити',
            formatHint: 'Підтримувані формати',
            formatDescription: 'Введіть тег, щоб надіслати платіж',
            userTagBanner: {
                title: 'Тег користувача',
                description:
                    'Ви можете знайти тег користувача на сторінці акаунту, натиснувши на значок акаунту на головній сторінці',
            },
            validation: {
                invalid: 'Невірний формат.',
                valid: 'Готово!',
                selfPayment: 'Неможливо оплатити себе.',
                selfPaymentTag: 'Неможливо використати власний тег.',
                loading: 'Завантажуємо інформацію…',
                clipboardError: 'Не вдалося отримати доступ до буфера. Вставте вручну.',
            },
        },
    },

    // Історія та баланс
    history: {
        title: 'Історія',
        balance: 'Баланс',
        loading: 'Завантаження історії…',
        error: 'Не вдалося завантажити історію.',
        empty: 'Ще немає історії',
        emptyDescription: "Тут з'являться ваші платежі.",
        receivedFrom: 'Від:',
        sentTo: 'До:',
        transactionDetails: 'Деталі',
        date: 'Дата',
        time: 'Час',
        pay: 'Сплатити',
    },

    // Транзакції
    transactions: {
        title: 'Транзакції',
        loading: 'Завантаження транзакцій…',
        error: 'Не вдалося завантажити транзакції.',
        empty: 'Транзакції відсутні',
        emptyDescription: 'Історія ваших транзакцій з’явиться тут',
        receivedFrom: 'Від:',
        sentTo: 'До:',
    },

    // Камера / сканер QR
    camera: {
        initializing: 'Запуск камери',
        initializingDescription: 'Зачекайте, триває доступ до камери…',
        scanTitle: 'Скануйте QR‑код',
        scanSubtitle: 'щоб оплатити',
        errors: {
            secureRequired: 'Потрібне захищене з’єднання',
            secureDescription: 'Доступ до камери потребує HTTPS. Використовуйте захищене з’єднання.',
            notSupported: 'Камера не підтримується',
            notSupportedDescription: 'Ваш пристрій або браузер не підтримує камеру.',
            permissionDenied: 'Доступ до камери заборонено',
            permissionDescription: 'Дозвольте доступ у налаштуваннях браузера та оновіть сторінку.',
            inUse: 'Камера вже використовується',
            inUseDescription: 'Інша програма використовує камеру. Закрийте її та спробуйте ще раз.',
            notFound: 'Камеру не знайдено',
            accessFailed: 'Не вдалося отримати доступ до камери. Спробуйте ще раз.',
            noDevice: 'На цьому пристрої камеру не виявлено.',
        },
    },

    // Акаунт та автентифікація
    account: {
        title: 'Акаунт',
        id: 'ID',
        userTag: 'Тег користувача',
        noAddress: 'Немає адреси',
        userTagLoading: 'Завантаження…',
        userTagCopied: 'Тег скопійовано!',
        logout: 'Вийти',
        almostThere: 'Майже готово',
        oneStep: 'Ще один крок',
        topUpInstruction: 'Щоб поповнити баланс, зверніться до каси.',
        copied: 'Скопійовано!',
        shared: 'Поділено',
        share: {
            addressTitle: 'Сплатіть мені у Clink',
            addressText: 'Надішліть мені платіж у Clink!\n\nID акаунта: {address}\n\nСплатити тут: {url}',
            tagTitle: 'Сплатіть мені у Clink',
            tagText: 'Легко сплатити мені у Clink!\nТег користувача: {tag}\n\nСплатити тут: {url}',
        },
    },

    // Web3 та помилки
    web3: {
        authFailed: 'Помилка автентифікації:',
        timeout: 'Зависло завантаження модулів Web3',
        unavailable: 'Модулі Web3 недоступні',
    },

    // UI‑компоненти
    ui: {
        pay: 'Сплатити',
        payByTag: 'Ввести вручну',
        continue: 'Продовжити',
        numpad: 'Клавіатура',
        backspace: 'Стерти',
    },

    // Перемикач мови
    language: {
        current: 'Мова',
        switch: 'Змінити мову',
        english: 'Англійська',
        ukrainian: 'Українська',
        french: 'Французька',
    },

    // Сторінка входу
    login: {
        title: 'Створіть акаунт',
        subtitle: 'Почніть із захищеного акаунта',
        info: 'Ваш акаунт приватний і захищений — особисті дані не потрібні.',
        methods: {
            email: 'Продовжити з email',
            google: 'Продовжити з Google',
        },
        email: {
            placeholder: 'your@email.com',
            submit: 'Надіслати',
            sending: 'Надсилання…',
            backToOptions: '← Повернутися до опцій',
        },
        otp: {
            title: 'Введіть код',
            description: 'Перевірте {email} і введіть код нижче.',
            pasteHint: 'Порада: вставте код Ctrl+V',
            didntReceive: 'Не отримали лист?',
            resendCode: 'Надіслати код повторно',
            resending: 'Надсилання…',
            backToEmail: '← Назад до email',
        },
    },

    // Профіль користувача та QR‑код
    user: {
        profile: 'Мій профіль',
        accountId: 'ID акаунта',
        qrCode: {
            title: 'Ваш QR‑код',
            description: 'Покажіть цей код, щоб поділитися акаунтом чи отримати платіж',
        },
    },

    // Статус WebSocket Yellow
    yellow: {
        status: {
            connected: 'Підключено',
            connecting: 'Підключення…',
            disconnected: 'Відключено',
            error: 'Помилка з’єднання',
        },
        session: 'Сесія',
        retrying: 'Повторне підключення…',
    },

    // Виклик автентифікації
    auth: {
        challenge: {
            title: 'Майже готово',
            description: 'Ще один крок, щоб розблокувати досвід',
            cancel: 'Не зараз',
            approve: 'Почати',
            processing: 'Зачекайте…',
        },
    },

    // Спільне посилання на оплату
    transfer: {
        sharedLink: {
            title: 'Хтось хоче отримати платіж',
            description: 'Налаштовуємо ваш платіж…',
            preparing: 'Підготовка платежу…',
            unauthorized: 'Увійдіть, щоб оплатити',
            loginRequired: 'Потрібна автентифікація для продовження',
        },
    },

    // Загальне UI
    common: {
        close: 'Закрити',
        confirm: 'Підтвердити',
        cancel: 'Скасувати',
        yes: 'Так',
        no: 'Ні',
        next: 'Далі',
        previous: 'Назад',
        save: 'Зберегти',
        delete: 'Видалити',
        edit: 'Редагувати',
        done: 'Готово',
        retry: 'Спробувати знову',
    },

    notifications: {
        transfer: {
            sent: 'Надіслано {amount} {asset} на {receiver}',
            received: 'Отримано {amount} {asset} від {sender}',
        },
    },
};
