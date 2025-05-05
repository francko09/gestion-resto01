import React from 'react';
import { Clock, Users, Award, Leaf, Facebook, Instagram, MessageCircle, Phone, Image, MapPin } from 'lucide-react';

export function AboutPage() {
  // Images de la galerie
  const galleryImages = [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b",
    "https://images.unsplash.com/photo-1515669097368-22e68427d265",
    "https://images.unsplash.com/photo-1564759224907-65b945ff0e84"
  ];

  const openingHours = {
    monday: { lunch: '12h00 - 15h00', dinner: '19h00 - 23h00' },
    tuesday: { lunch: '12h00 - 15h00', dinner: '19h00 - 23h00' },
    wednesday: { lunch: '12h00 - 15h00', dinner: '19h00 - 23h00' },
    thursday: { lunch: '12h00 - 15h00', dinner: '19h00 - 23h00' },
    friday: { lunch: '12h00 - 15h00', dinner: '19h00 - 23h30' },
    saturday: { lunch: '12h00 - 16h00', dinner: '19h00 - 23h30' },
    sunday: { lunch: '12h00 - 16h00', dinner: '19h00 - 23h00' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Notre Histoire
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Depuis 2010, nous partageons notre passion pour la gastronomie française avec nos clients.
          Notre restaurant est né d'un rêve : celui de créer un lieu où tradition et innovation se rencontrent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Horaires</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Ouvert 7j/7<br />
            Service midi et soir
          </p>
        </div>

        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Notre Équipe</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Une équipe passionnée<br />
            de 15 professionnels<br />
            à votre service
          </p>
        </div>

        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Récompenses</h3>
          <p className="text-gray-600 dark:text-gray-300">
            2 étoiles au guide<br />
            Meilleur restaurant 2023<br />
            Prix d'excellence
          </p>
        </div>

        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Leaf className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nos Valeurs</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Produits locaux<br />
            Agriculture durable<br />
            Zéro déchet
          </p>
        </div>
      </div>

      {/* Section Horaires Détaillés */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md mb-16">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center flex items-center justify-center">
          <Clock className="w-8 h-8 mr-3 text-blue-600" />
          Nos Horaires d'Ouverture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Lundi à Jeudi */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 text-center">
              Lundi à Jeudi
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Déjeuner</span>
                <span className="text-gray-900 dark:text-white font-medium">{openingHours.monday.lunch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Dîner</span>
                <span className="text-gray-900 dark:text-white font-medium">{openingHours.monday.dinner}</span>
              </div>
            </div>
          </div>

          {/* Vendredi et Samedi */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 text-center">
              Vendredi et Samedi
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Déjeuner</span>
                <span className="text-gray-900 dark:text-white font-medium">{openingHours.friday.lunch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Dîner</span>
                <span className="text-gray-900 dark:text-white font-medium">{openingHours.friday.dinner}</span>
              </div>
            </div>
          </div>

          {/* Dimanche */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 text-center">
              Dimanche
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Déjeuner</span>
                <span className="text-gray-900 dark:text-white font-medium">{openingHours.sunday.lunch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Dîner</span>
                <span className="text-gray-900 dark:text-white font-medium">{openingHours.sunday.dinner}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 dark:text-gray-300">
          <p className="italic">
            Notre cuisine ferme 30 minutes avant la fermeture du restaurant.<br />
            Le bar reste ouvert jusqu'à la fermeture.
          </p>
          <p className="mt-4 text-sm">
            * Réservation conseillée les week-ends et jours fériés
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <img
            src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf"
            alt="Notre restaurant"
            className="rounded-lg shadow-lg w-full h-96 object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Une Cuisine d'Exception
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Notre chef étoilé et son équipe créent des plats qui allient tradition française
            et créativité moderne. Chaque assiette est pensée comme une œuvre d'art,
            mettant en valeur les meilleurs produits de notre région.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Nous sélectionnons rigoureusement nos fournisseurs locaux pour vous garantir
            une qualité exceptionnelle et une traçabilité parfaite de nos produits.
            Notre cave à vin recèle des trésors qui sauront accompagner parfaitement vos mets.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-8 text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Réservez Votre Table
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Pour une expérience gastronomique inoubliable, réservez votre table
          dès maintenant et laissez-nous prendre soin de vous.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Réserver une table
        </button>
      </div>

      {/* Section Galerie */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Notre Galerie
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
              <img
                src={image}
                alt={`Galerie image ${index + 1}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section Réseaux Sociaux et Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Réseaux Sociaux */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Suivez-nous
          </h3>
          <div className="space-y-4">
            <a
              href="https://www.tiktok.com/@votrerestaurant"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
              </svg>
              <span>TikTok</span>
            </a>
            <a
              href="https://www.instagram.com/votrerestaurant"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400"
            >
              <Instagram className="w-6 h-6" />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/votrerestaurant"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Facebook className="w-6 h-6" />
              <span>Facebook</span>
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Contactez-nous
          </h3>
          <div className="space-y-4">
            <a
              href="https://wa.me/+22500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
            <a
              href="https://m.me/votrerestaurant"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <MessageCircle className="w-6 h-6" />
              <span>Messenger</span>
            </a>
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <Phone className="w-6 h-6" />
              <span>+225 00 00 00 00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Localisation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-16">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <MapPin className="w-6 h-6 mr-2" />
          Notre Localisation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              <strong>Adresse :</strong><br />
              89 Boulevard du 13 Janvier<br />
              Quartier Administratif<br />
              Lomé, Togo
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              <strong>Points de repère :</strong><br />
              - À côté de l'Hôtel 2 Février<br />
              - En face de la BCEAO<br />
              - À 5 minutes de la plage
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Parking :</strong><br />
              Parking gratuit disponible<br />
              Service voiturier le soir
            </p>
          </div>
          <div className="h-64 md:h-full min-h-[300px] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.9214617756064!2d1.2276889!3d6.1307863!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMDcnNTAuOSJOIDHCsDEzJzM5LjciRQ!5e0!3m2!1sfr!2stg!4v1635959144816!5m2!1sfr!2stg"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation du restaurant"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}