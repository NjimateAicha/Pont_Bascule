sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageBox, MessageToast, History) {
    "use strict";

    return Controller.extend("projectsd.controller.Commande.Commande", {

        onInit: function () {
            var oCommandeModel = new JSONModel({
                Idcommande: "",
                Datecommande: null,
                Quantite: "1",  // Valeur par défaut pour la quantité
                Prixtotal: "",
                Idclient: "",
                Nomclient: "",
                Adresse: "",
                Idarticle: "",
                Nomarticle: "",
                Prixunitaire: ""
            });
            this.getView().setModel(oCommandeModel, "newCommande");

            this._oODataModel = this.getOwnerComponent().getModel();
            this._setupSmartTable();
        },

        _setupSmartTable: function () {
            var oSmartTable = this.getView().byId("smartTableCommande");
            if (oSmartTable) {
                oSmartTable.setInitiallyVisibleFields("Idcommande,Datecommande,Nomclient,Nomarticle,Prixunitaire,Quantite,Prixtotal");
            }
        },

        onAddCommandePress: function () {
            var oDialog = this.getView().byId("addCommandeDialog");
            if (oDialog) {
                // Réinitialiser le modèle à chaque ouverture
                this.getView().getModel("newCommande").setData({
                    Idcommande: "",
                    Datecommande: null,
                    Quantite: "1",
                    Prixtotal: "",
                    Idclient: "",
                    Nomclient: "",
                    Adresse: "",
                    Idarticle: "",
                    Nomarticle: "",
                    Prixunitaire: ""
                });
                
                this.getView().addDependent(oDialog);
                oDialog.open();
            } else {
                MessageBox.error("Erreur : le dialogue 'addCommandeDialog' est introuvable.");
            }
        },

        onCancelDialog: function () {  // Nom corrigé pour correspondre à la vue
            this.getView().byId("addCommandeDialog").close();
        },
        onSaveCommande: function () {
            var oModel = this._oODataModel;
            var oView = this.getView();
            var oData = oView.getModel("newCommande").getData();
            var self = this;
        
            // Validate required fields
            if (!oData.Idcommande || !oData.Idclient || !oData.Idarticle) {
                MessageBox.error("Champs requis : ID Commande, Client, Article.");
                return;
            }
        
            // Parse and validate Quantite as integer
            var quantite  = (oData.Quantite).toFixed(3).toString();
            if (isNaN(quantite) || quantite <= 0) {
                MessageBox.error("Quantité invalide. Veuillez saisir un nombre entier positif.");
                return;
            }
        
            // Parse and validate Prixunitaire
            var prixUnitaire = parseFloat(oData.Prixunitaire);
            if (isNaN(prixUnitaire) || prixUnitaire < 0) {
                MessageBox.error("Prix unitaire invalide.");
                return;
            }
        
            // Calculate price total
            var prixTotal = (quantite * prixUnitaire).toFixed(3).toString;
    
        
            // Create a clean payload object matching backend expectations
            var oPayload = {
                Idcommande: oData.Idcommande,
                Datecommande: oData.Datecommande || null,
                Quantite: quantite,      // Integer
                Prixtotal: prixTotal,    // Float with 2 decimal places 
                Idclient: oData.Idclient,
                Idarticle: oData.Idarticle
            };
        
            // Debug payload before sending
            console.log("Payload being sent:", JSON.stringify(oPayload));
        
            // Try different approach with the create call
            try {
                oModel.create("/ZCDS_commande", oPayload, {
                    success: function (oData, oResponse) {
                        MessageToast.show("Commande enregistrée avec succès.");
                        self.getView().byId("addCommandeDialog").close();
                        
                        var oSmartTable = self.getView().byId("smartTableCommande");
                        if (oSmartTable) {
                            oSmartTable.rebindTable();
                        }
                    },
                    error: function (oError) {
                        console.error("Full error object:", oError);
                        
                        var sErrorDetails = "Erreur inconnue";
                        if (oError.responseText) {
                            try {
                                var oErrorResponse = JSON.parse(oError.responseText);
                                sErrorDetails = oErrorResponse.error.message.value || JSON.stringify(oErrorResponse);
                            } catch (e) {
                                sErrorDetails = oError.responseText;
                            }
                        }
                        
                        // Show detailed error
                        MessageBox.error("Erreur lors de l'enregistrement de la commande: " + sErrorDetails);
                    }
                });
            } catch (e) {
                console.error("Exception during create operation:", e);
                MessageBox.error("Exception lors de la création: " + e.message);
            }
        },

        // Gestionnaire pour le changement de client
        onClientChange: function (oEvent) {
            console.log("onClientChange appelé");
            var oSelectedItem = oEvent.getParameter("selectedItem");
            
            if (!oSelectedItem) {
                console.log("Aucun élément sélectionné");
                return;
            }
            
            var oContext = oSelectedItem.getBindingContext();
            
            if (!oContext) {
                console.log("Pas de contexte de binding");
                return;
            }
            
            var oClientData = oContext.getObject();
            console.log("Données client récupérées:", oClientData);
            
            var oCommandeModel = this.getView().getModel("newCommande");
            oCommandeModel.setProperty("/Idclient", oClientData.Idclient);
            oCommandeModel.setProperty("/Nomclient", oClientData.Nomclient);
            oCommandeModel.setProperty("/Adresse", oClientData.Adresse);
        },

        // Gestionnaire pour le changement d'article
        onArticleChange: function (oEvent) {
            console.log("onArticleChange appelé");
            var oSelectedItem = oEvent.getParameter("selectedItem");
            
            if (!oSelectedItem) {
                console.log("Aucun élément sélectionné");
                return;
            }
            
            var oContext = oSelectedItem.getBindingContext();
            
            if (!oContext) {
                console.log("Pas de contexte de binding");
                return;
            }
            
            var oArticleData = oContext.getObject();
            console.log("Données article récupérées:", oArticleData);
            
            var oCommandeModel = this.getView().getModel("newCommande");
            oCommandeModel.setProperty("/Idarticle", oArticleData.Idarticle);
            oCommandeModel.setProperty("/Nomarticle", oArticleData.Nomarticle);
            oCommandeModel.setProperty("/Prixunitaire", oArticleData.Prixunitaire);
            
            // Mise à jour du prix total
            var iQuantite = parseInt(oCommandeModel.getProperty("/Quantite"), 10) || 1;
            var fPrix = oArticleData.Prixunitaire || 0;
            oCommandeModel.setProperty("/Prixtotal", iQuantite * fPrix);
        },

        // Mise à jour du prix total lors du changement de quantité
        onQuantiteChange: function (oEvent) {
            var iQuantite = parseInt(oEvent.getSource().getValue(), 10);
            var oCommandeModel = this.getView().getModel("newCommande");
            var fPrix = parseFloat(oCommandeModel.getProperty("/Prixunitaire")) || 0;
            
            if (!isNaN(iQuantite) && iQuantite > 0) {
                oCommandeModel.setProperty("/Quantite", iQuantite);
                oCommandeModel.setProperty("/Prixtotal", iQuantite * fPrix);
            } else {
                MessageBox.error("Quantité invalide. Veuillez saisir un nombre positif.");
                // Réinitialiser à 1 par défaut
                oCommandeModel.setProperty("/Quantite", "1");
                oCommandeModel.setProperty("/Prixtotal", 1 * fPrix);
            }
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteAccueil", {}, true);
            }
        }
    });
});