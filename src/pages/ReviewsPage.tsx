import React, { useState } from 'react';
import { Star, ThumbsUp, Calendar, User } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  phone: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      name: "Sophie K.",
      phone: "+228 90 XX XX XX",
      rating: 5,
      comment: "Une expérience culinaire exceptionnelle ! Les plats sont délicieux et le service est impeccable. Je recommande particulièrement le poisson du jour.",
      date: "2024-03-15",
      likes: 12
    },
    {
      id: 2,
      name: "Marc D.",
      phone: "+228 91 XX XX XX",
      rating: 4,
      comment: "Très bon restaurant, ambiance agréable et carte des vins bien fournie. Les desserts sont un vrai régal.",
      date: "2024-03-10",
      likes: 8
    },
    {
      id: 3,
      name: "Aminata F.",
      phone: "+228 70 XX XX XX",
      rating: 5,
      comment: "Le meilleur restaurant de la ville ! Le chef propose des plats créatifs qui mettent en valeur les produits locaux. Service attentionné.",
      date: "2024-03-05",
      likes: 15
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    rating: 5,
    comment: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReview: Review = {
      id: reviews.length + 1,
      name: formData.name,
      phone: formData.phone,
      rating: formData.rating,
      comment: formData.comment,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };
    setReviews([newReview, ...reviews]);
    setFormData({ name: '', phone: '', rating: 5, comment: '' });
  };

  const handleLike = (reviewId: number) => {
    setReviews(reviews.map(review =>
      review.id === reviewId ? { ...review, likes: review.likes + 1 } : review
    ));
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Avis de nos Clients
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Découvrez les expériences de nos clients et partagez la vôtre.
          Votre avis est précieux pour nous aider à nous améliorer continuellement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        {/* Statistiques */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {reviews.length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Avis clients</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {(reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Note moyenne</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {reviews.reduce((acc, rev) => acc + rev.likes, 0)}
            </div>
            <div className="text-gray-600 dark:text-gray-300">J'aime</div>
          </div>
        </div>

        {/* Formulaire d'avis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Donnez votre avis
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Votre nom
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+228 XX XX XX XX"
                pattern="^\+228\s[0-9]{2}\s[0-9]{2}\s[0-9]{2}\s[0-9]{2}$"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Format: +228 XX XX XX XX
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Votre commentaire
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
                       hover:bg-blue-700 transition-colors"
            >
              Publier l'avis
            </button>
          </form>
        </div>

        {/* Liste des avis */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Avis récents
          </h2>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <User className="w-10 h-10 text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full p-2" />
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">{review.name}</h3>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {review.date}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {review.comment}
                </p>
                <button
                  onClick={() => handleLike(review.id)}
                  className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>{review.likes}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}