sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageBox, MessageToast, History) {
    "use strict";

    return Controller.extend("projectsd.controller.Commande.Article", {

        onInit: function () {
            // Modèle pour le formulaire de création d’un nouvel article
            var oArticleModel = new JSONModel({
                Idarticle: "",
                Nomarticle: "",
                Description: "",
                Prixunitaire: ""
            });
            this.getView().setModel(oArticleModel, "newArticle");

            // Obtenir le modèle OData
            this._oODataModel = this.getOwnerComponent().getModel();

            // Configuration SmartTable
            this._setupSmartTable();
        },

        _setupSmartTable: function () {
            var oSmartTable = this.getView().byId("smartTableArticle");
            if (oSmartTable) {
                oSmartTable.setInitiallyVisibleFields("Idarticle,Nomarticle,Description,Prixunitaire");
            }
        },

        // Ouvrir le Dialog
        onAddArticlePress: function () {
            var oDialog = this.getView().byId("addArticleDialog");
            if (oDialog) {
                this.getView().addDependent(oDialog);
                oDialog.open();
            } else {
                MessageBox.error("Erreur : le dialogue 'addArticleDialog' est introuvable.");
            }
        },

        // Fermer le Dialog
        onCancelArticleDialog: function () {
            this.getView().byId("addArticleDialog").close();
        },

        // Sauvegarder un nouvel article
        onSaveArticle: function () {
            var oModel = this._oODataModel;
            var oView = this.getView();
            var oNewArticle = oView.getModel("newArticle").getData();

            // Validation des champs requis
            if (!oNewArticle.Idarticle || !oNewArticle.Nomarticle) {
                MessageBox.error("Veuillez remplir les champs obligatoires (ID Article et Nom).");
                return;
            }

            // Création dans l'OData
            oModel.create("/ZCDS_article", oNewArticle, {
                success: function () {
                    MessageToast.show("Article ajouté avec succès.");
                    oView.byId("addArticleDialog").close();

                    // Réinitialiser le modèle
                    oView.getModel("newArticle").setData({
                        Idarticle: "",
                        Nomarticle: "",
                        Description: "",
                        Prixunitaire: ""
                    });

                    // Rafraîchir la table
                    var oSmartTable = oView.byId("smartTableArticle");
                    if (oSmartTable) {
                        oSmartTable.rebindTable();
                    }
                },
                error: function () {
                    MessageBox.error("Erreur lors de l'ajout de l'article.");
                }
            });
        },

        // Bouton de retour
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
