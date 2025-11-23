import type { TranslationKey } from '../types';

export const fr: TranslationKey = {
    // Général
    appName: 'Clink',
    loading: 'Un instant…',
    skip: 'Passer',
    tapToContinue: 'Touchez pour continuer',

    // Histoires d’onboarding
    onboarding: {
        discover: {
            title: 'Découvrez des œuvres caritatives',
            subtitle: 'Trouvez des causes qui vous tiennent à cœur',
            description: 'Parcourez des organisations caritatives vérifiées et trouvez celles qui font une vraie différence dans le monde.',
        },
        donate: {
            title: 'Faites un impact',
            subtitle: 'Donnez facilement',
            description: 'Soutenez vos organisations caritatives préférées avec des dons sécurisés et instantanés — chaque contribution compte.',
        },
        track: {
            title: 'Suivez votre générosité',
            subtitle: 'Voyez votre impact',
            description: 'Suivez les progrès des œuvres caritatives et voyez comment vos dons aident à atteindre des objectifs importants.',
        },
        progress: 'Étape {current} sur {total}',
    },

    // Accueil
    home: {
        title: 'Clink',
        subtitle: 'Votre appli de commande de boissons',
        buttons: {
            orderDrinks: 'Commander des boissons',
            topUpBalance: 'Ajouter des fonds',
            myAccount: 'Mon compte',
        },
    },

    // Limitation mobile
    mobileOnly: {
        title: 'Conçu pour le mobile',
        description:
            'Clink est optimisé pour les téléphones et tablettes afin de vous offrir la meilleure expérience.',
        instruction: 'Ouvrez‑la depuis votre téléphone ou tablette',
    },

    // Installation PWA
    pwa: {
        install: {
            title: 'Installer Clink',
            description: 'pour une expérience optimale',
            button: 'Installer',
            dismiss: 'Plus tard',
            howTo: 'Comment installer',
        },
        ios: {
            title: 'Installer Clink',
            step1: {
                title: 'Touchez Partager',
                description: 'Dans Safari, touchez le bouton Partager en bas de l’écran',
            },
            step2: {
                title: 'Ajoutez sur l’écran d’accueil',
                description: 'Faites défiler puis touchez « Sur l’écran d’accueil »',
            },
            step3: {
                title: 'Confirmez',
                description: 'Touchez « Ajouter » en haut à droite pour terminer',
            },
        },
        status: {
            installing: 'Installation…',
            installed: 'Clink est prête !',
            failed: 'Échec de l’installation. Réessayez.',
            unsupported: 'Installation non prise en charge sur ce navigateur.',
        },
    },

    // Paiement
    payment: {
        balance: 'Votre solde',
        available: 'Disponible :',
        amountExceeds: 'Le montant dépasse votre solde.',
        payAmount: 'Payer',
        slideToPay: 'Faites glisser pour payer',
        to: 'À :',
        success: 'Paiement envoyé !',
        receiver: 'Destinataire',
        sender: 'Expéditeur',
        date: 'Date',
        transactionFailed: 'La transaction a échoué',
        scanFailed: 'Impossible de scanner le QR code. Réessayez.',
        error: {
            default: 'Transaction échouée',
            insufficient: 'Solde insuffisant',
            timeout: 'Délai dépassé',
            tag: 'Tag utilisateur introuvable',
            unknown: 'Erreur inattendue',
        },
        qr: {
            invalidAddress: 'Adresse invalide',
            invalidAddressDescription: 'Scannez une adresse EVM valide.',
            ownAddress: 'Vous ne pouvez pas vous payer',
            ownAddressDescription: 'Impossible d’envoyer de l’argent à votre propre adresse.',
            ownUserTag: 'Vous ne pouvez pas vous payer',
            ownUserTagDescription: "Impossible d'envoyer de l'argent à votre propre tag.",
            invalidUserTag: 'Tag utilisateur invalide',
            invalidUserTagDescription: 'Scannez un tag utilisateur valide.',
            invalidQrCode: 'QR code invalide',
            invalidQrCodeDescription: 'Scannez un QR code de portefeuille ou tag valide.',
            scanInstruction: 'Placez le QR code dans le cadre.',
            loadingUserInfo: 'Récupération des infos utilisateur…',
            manualEntry: 'Saisie manuelle',
            backToScan: 'Scanner le QR code',
        },
        manual: {
            title: 'Saisir un tag utilisateur',
            subtitle: 'Tag du destinataire',
            inputLabel: 'Tag utilisateur',
            inputPlaceholder: 'Tag utilisateur',
            pasteButton: 'Coller',
            pasting: 'Collage…',
            continueButton: 'Continuer',
            formatHint: 'Formats acceptés',
            formatDescription: 'Entrez un tag pour envoyer un paiement',
            userTagBanner: {
                title: 'Tag utilisateur',
                description:
                    'Vous pouvez trouver le tag utilisateur sur la page compte en cliquant sur l’icône compte sur la page d’accueil',
            },
            validation: {
                invalid: 'Format invalide.',
                valid: 'Parfait !',
                selfPayment: 'Vous ne pouvez pas vous payer.',
                selfPaymentTag: 'Vous ne pouvez pas utiliser votre propre tag.',
                loading: 'Récupération des infos utilisateur…',
                clipboardError: 'Accès au presse‑papiers impossible. Collez manuellement.',
            },
        },
    },

    // Historique & solde
    history: {
        title: 'Historique',
        balance: 'Solde',
        loading: "Chargement de l'historique…",
        error: "Impossible de charger l'historique.",
        empty: 'Aucun historique pour le moment',
        emptyDescription: "Vos paiements s'afficheront ici.",
        receivedFrom: 'De:',
        sentTo: 'À:',
        transactionDetails: 'Détails',
        date: 'Date',
        time: 'Heure',
        pay: 'Payer',
    },

    // Transactions
    transactions: {
        title: 'Transactions',
        loading: 'Chargement des transactions…',
        error: 'Impossible de charger les transactions.',
        empty: 'Aucune transaction',
        emptyDescription: 'Votre historique de transactions apparaîtra ici',
        receivedFrom: 'De:',
        sentTo: 'À:',
    },

    // Caméra / scanner QR
    camera: {
        initializing: 'Lancement de la caméra',
        initializingDescription: 'Merci de patienter pendant l’accès à la caméra…',
        scanTitle: 'Scannez le QR code',
        scanSubtitle: 'pour payer',
        errors: {
            secureRequired: 'Connexion sécurisée requise',
            secureDescription: 'L’accès à la caméra nécessite HTTPS. Utilisez une connexion sécurisée.',
            notSupported: 'Caméra non prise en charge',
            notSupportedDescription: 'Votre appareil ou navigateur ne prend pas en charge la caméra.',
            permissionDenied: 'Accès caméra refusé',
            permissionDescription: 'Autorisez l’accès à la caméra dans les réglages du navigateur, puis actualisez.',
            inUse: 'Caméra déjà utilisée',
            inUseDescription: 'Fermez les autres applications utilisant la caméra et réessayez.',
            notFound: 'Caméra introuvable',
            accessFailed: 'Accès caméra impossible. Réessayez.',
            noDevice: 'Aucune caméra détectée.',
        },
    },

    // Compte & authentification
    account: {
        title: 'Compte',
        id: 'ID',
        userTag: 'Tag utilisateur',
        noAddress: 'Aucune adresse',
        userTagLoading: 'Chargement…',
        userTagCopied: 'Tag copié !',
        logout: 'Se déconnecter',
        almostThere: 'Presque prêt',
        oneStep: 'Encore une étape pour débloquer l’expérience',
        topUpInstruction: 'Pour recharger, rendez‑vous à la caisse.',
        copied: 'Copié !',
        shared: 'Partagé',
        share: {
            addressTitle: 'Payez‑moi sur Clink',
            addressText: 'Envoyez‑moi un paiement sur Clink !\n\nID du compte : {address}\n\nPayez‑moi ici : {url}',
            tagTitle: 'Payez‑moi sur Clink',
            tagText: 'C’est facile de me payer sur Clink !\nTag utilisateur : {tag}\n\nPayez‑moi ici : {url}',
        },
    },

    // Web3 & erreurs
    web3: {
        authFailed: 'Authentification échouée :',
        timeout: 'Chargement des modules Web3 trop long',
        unavailable: 'Modules Web3 indisponibles',
    },

    // Composants UI
    ui: {
        pay: 'Payer',
        payByTag: 'Entrer manuellement',
        continue: 'Continuer',
        numpad: 'Clavier',
        backspace: 'Effacer',
    },

    // Sélecteur de langue
    language: {
        current: 'Langue',
        switch: 'Changer de langue',
        english: 'Anglais',
        ukrainian: 'Ukrainien',
        french: 'Français',
    },

    // Page de connexion
    login: {
        title: 'Créer un compte',
        subtitle: 'Commencez avec un compte sécurisé',
        info: 'Votre compte est privé et sécurisé : aucune information personnelle requise.',
        methods: {
            email: 'Continuer avec l’e‑mail',
            google: 'Continuer avec Google',
        },
        email: {
            placeholder: 'votre@email.com',
            submit: 'Envoyer',
            sending: 'Envoi…',
            backToOptions: '← Retour aux options',
        },
        otp: {
            title: 'Entrez le code',
            description: 'Consultez {email} pour notre e‑mail et saisissez le code ci‑dessous.',
            pasteHint: 'Astuce : collez le code complet avec Ctrl+V',
            didntReceive: 'Vous n’avez pas reçu d’e‑mail ?',
            resendCode: 'Renvoyer le code',
            resending: 'Envoi…',
            backToEmail: '← Retour à l’e‑mail',
        },
    },

    // Profil utilisateur & QR code
    user: {
        profile: 'Mon profil',
        accountId: 'ID du compte',
        qrCode: {
            title: 'Votre QR code',
            description: 'Montrez ce code pour partager votre compte ou recevoir un paiement',
        },
    },

    // Statut WebSocket Yellow
    yellow: {
        status: {
            connected: 'Connecté',
            connecting: 'Connexion…',
            disconnected: 'Déconnecté',
            error: 'Erreur de connexion',
        },
        session: 'Session',
        retrying: 'Reconnexion…',
    },

    // Défi d’authentification
    auth: {
        challenge: {
            title: 'Presque prêt',
            description: 'Encore une étape pour débloquer l’expérience',
            cancel: 'Plus tard',
            approve: 'Commencer',
            processing: 'Un instant…',
        },
    },

    // Lien de paiement partagé
    transfer: {
        sharedLink: {
            title: 'Quelqu’un souhaite recevoir un paiement',
            description: 'Préparation de votre paiement…',
            preparing: 'Préparation du paiement…',
            unauthorized: 'Veuillez vous connecter pour payer',
            loginRequired: 'Authentification requise pour continuer',
        },
    },

    // Commun
    common: {
        close: 'Fermer',
        confirm: 'Confirmer',
        cancel: 'Annuler',
        yes: 'Oui',
        no: 'Non',
        next: 'Suivant',
        previous: 'Précédent',
        save: 'Enregistrer',
        delete: 'Supprimer',
        edit: 'Modifier',
        done: 'Terminé',
        retry: 'Réessayer',
    },

    notifications: {
        transfer: {
            sent: 'Envoyé {amount} {asset} à {receiver}',
            received: 'Reçu {amount} {asset} de {sender}',
        },
    },
};
