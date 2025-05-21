sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/odata/v2/ODataModel",
  "sap/m/MessageToast",
  "sap/ui/core/format/DateFormat"
], function (Controller, JSONModel, ODataModel, MessageToast, DateFormat) {
  "use strict";

  return Controller.extend("projectsd.controller.Dashboard", {
      
      onInit: function () {
          this._initializeModels();
          this._loadDashboardData();
          this._setupRefreshTimer();
      },

      /**
       * Initialise les modèles de données
       */
      _initializeModels: function () {
          var oDashboardModel = new JSONModel({
              totalCommandes: 0,
              totalClients: 0,
              totalArticles: 0,
              totalTransporteurs: 0,
              totalVehicules: 0,
              totalChauffeurs: 0,
              chartTransporteurs: [],
              currentDate: new Date(),
              loading: false,
              lastRefresh: new Date()
          });
          
          this.getView().setModel(oDashboardModel, "dashboard");
          this.oDataModel = this.getOwnerComponent().getModel();
      },

      /**
       * Charge toutes les données du dashboard
       */
      _loadDashboardData: function () {
          var that = this;
          var oDashboardModel = this.getView().getModel("dashboard");
          
          oDashboardModel.setProperty("/loading", true);

          // Promise.all pour charger toutes les données en parallèle
          Promise.all([
              this._loadCommandes(),
              this._loadClients(),
              this._loadArticles(),
              this._loadTransporteurs(),
              this._loadVehicules(),
              this._loadChauffeurs()
          ]).then(function () {
              // Charger les données du graphique après avoir toutes les métriques
              return that._loadChartData();
          }).then(function () {
              oDashboardModel.setProperty("/loading", false);
              oDashboardModel.setProperty("/lastRefresh", new Date());
              MessageToast.show("Données actualisées avec succès", {
                  duration: 2000,
                  width: "15em"
              });
          }).catch(function (error) {
              oDashboardModel.setProperty("/loading", false);
              MessageToast.show("Erreur lors du chargement des données", {
                  duration: 3000,
                  width: "20em"
              });
              console.error("Erreur dashboard:", error);
          });
      },

      /**
       * Charge le nombre de commandes
       */
      _loadCommandes: function () {
          var that = this;
          return new Promise(function (resolve, reject) {
              that.oDataModel.read("/ZCDS_commande/$count", {
                  success: function (oData) {
                      that.getView().getModel("dashboard").setProperty("/totalCommandes", parseInt(oData));
                      resolve();
                  },
                  error: function (oError) {
                      console.error("Erreur commandes:", oError);
                      reject(oError);
                  }
              });
          });
      },

      /**
       * Charge le nombre de clients
       */
      _loadClients: function () {
          var that = this;
          return new Promise(function (resolve, reject) {
              that.oDataModel.read("/ZCDS_Clientt/$count", {
                  success: function (oData) {
                      that.getView().getModel("dashboard").setProperty("/totalClients", parseInt(oData));
                      resolve();
                  },
                  error: function (oError) {
                      console.error("Erreur clients:", oError);
                      reject(oError);
                  }
              });
          });
      },

      /**
       * Charge le nombre d'articles
       */
      _loadArticles: function () {
          var that = this;
          return new Promise(function (resolve, reject) {
              that.oDataModel.read("/ZCDS_article/$count", {
                  success: function (oData) {
                      that.getView().getModel("dashboard").setProperty("/totalArticles", parseInt(oData));
                      resolve();
                  },
                  error: function (oError) {
                      console.error("Erreur articles:", oError);
                      reject(oError);
                  }
              });
          });
      },

      /**
       * Charge le nombre de transporteurs
       */
      _loadTransporteurs: function () {
          var that = this;
          return new Promise(function (resolve, reject) {
              that.oDataModel.read("/zcds_transporter/$count", {
                  success: function (oData) {
                      that.getView().getModel("dashboard").setProperty("/totalTransporteurs", parseInt(oData));
                      resolve();
                  },
                  error: function (oError) {
                      console.error("Erreur transporteurs:", oError);
                      reject(oError);
                  }
              });
          });
      },

      /**
       * Charge le nombre de véhicules
       */
      _loadVehicules: function () {
          var that = this;
          return new Promise(function (resolve, reject) {
              that.oDataModel.read("/ZCDS_vehicule/$count", {
                  success: function (oData) {
                      that.getView().getModel("dashboard").setProperty("/totalVehicules", parseInt(oData));
                      resolve();
                  },
                  error: function (oError) {
                      console.error("Erreur véhicules:", oError);
                      reject(oError);
                  }
              });
          });
      },

      /**
       * Charge le nombre de chauffeurs
       */
      _loadChauffeurs: function () {
          var that = this;
          return new Promise(function (resolve, reject) {
              that.oDataModel.read("/zcds_chauffeur/$count", {
                  success: function (oData) {
                      that.getView().getModel("dashboard").setProperty("/totalChauffeurs", parseInt(oData));
                      resolve();
                  },
                  error: function (oError) {
                      console.error("Erreur chauffeurs:", oError);
                      reject(oError);
                  }
              });
          });
      },

      /**
       * Charge les données pour les graphiques
       */
      _loadChartData: function () {
          var that = this;
          var oDashboardModel = this.getView().getModel("dashboard");
          
          return new Promise(function (resolve, reject) {
              // Créer le graphique avec toutes les métriques
              var aAllMetrics = [
                  {
                      categorie: "Commandes",
                      valeur: oDashboardModel.getProperty("/totalCommandes") || 0
                  },
                  {
                      categorie: "Clients", 
                      valeur: oDashboardModel.getProperty("/totalClients") || 0
                  },
                  {
                      categorie: "Articles",
                      valeur: oDashboardModel.getProperty("/totalArticles") || 0
                  },
                  {
                      categorie: "Transporteurs",
                      valeur: oDashboardModel.getProperty("/totalTransporteurs") || 0
                  },
                  {
                      categorie: "Véhicules",
                      valeur: oDashboardModel.getProperty("/totalVehicules") || 0
                  },
                  {
                      categorie: "Chauffeurs",
                      valeur: oDashboardModel.getProperty("/totalChauffeurs") || 0
                  }
              ];
              
              oDashboardModel.setProperty("/chartAllMetrics", aAllMetrics);
              resolve();
          });
      },

      /**
       * Formate la date pour l'affichage
       */
      formatDate: function (oDate) {
          if (!oDate) return "";
          var oDateFormat = DateFormat.getDateTimeInstance({
              pattern: "dd/MM/yyyy 'à' HH:mm"
          });
          return oDateFormat.format(oDate);
      },

      /**
       * Gestion du clic sur les tuiles KPI
       */
      onTilePress: function (oEvent) {
          var sTileId = oEvent.getSource().getId();
          var sMessage = "Navigation vers la vue détaillée";
          
          // Logique de navigation selon la tuile cliquée
          if (sTileId.includes("commandes")) {
              sMessage = "Navigation vers la liste des commandes";
              // this.getRouter().navTo("commandes");
          } else if (sTileId.includes("clients")) {
              sMessage = "Navigation vers la liste des clients";
              // this.getRouter().navTo("clients");
          }
          // ... autres cas
          
          MessageToast.show(sMessage, {
              duration: 2000
          });
      },

      /**
       * Agrandir le graphique
       */
      onExpandChart: function () {
          MessageToast.show("Fonctionnalité d'agrandissement à implémenter", {
              duration: 2000
          });
      },

      /**
       * Actualiser les données
       */
      onRefreshData: function () {
          this._loadDashboardData();
      },

      /**
       * Configure un timer pour actualiser automatiquement les données
       */
      _setupRefreshTimer: function () {
          var that = this;
          // Actualisation automatique toutes les 5 minutes
          setInterval(function () {
              that._loadDashboardData();
          }, 300000);
      },

      /**
       * Nettoyage lors de la destruction du contrôleur
       */
      onExit: function () {
          // Nettoyer les timers si nécessaire
      }
  });
});