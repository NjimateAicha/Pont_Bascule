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
                Prixunitaire: "",
                Quantitearticle: ""
            });
            this.getView().setModel(oArticleModel, "newArticle");

            // Obtenir le modèle OData
            this._oODataModel = this.getOwnerComponent().getModel();
               // Récupérer la SmartTable
    var oSmartTable = this.byId("smartTableArticle");

            // Configuration SmartTable
            this._setupSmartTable();
                  // Attendre que la table réelle soit disponible
            oSmartTable.attachInitialise(() => {
                    const oTable = oSmartTable.getTable();
                    
                    // Si la table est une ResponsiveTable (sap.m.Table), utilise cette méthode
                    if (oTable.setMode) {
                      oTable.setMode("SingleSelectMaster"); // ou "MultiSelect"
                    }
                  });
        },

        _setupSmartTable: function () {
            var oSmartTable = this.getView().byId("smartTableArticle");
            if (oSmartTable) {
                oSmartTable.setInitiallyVisibleFields("Idarticle,Nomarticle,Description,Prixunitaire , Quantitearticle");
            }
        },
        onAddArticlePress: function () {
            var oDialog = this.getView().byId("addArticleDialog");
        
            this._generateNextIdArticle((nextId) => {
                // Injecter dans le modèle
                var oModel = this.getView().getModel("newArticle");
                oModel.setData({
                    Idarticle: nextId,
                    Nomarticle: "",
                    Description: "",
                    Prixunitaire: "",
                    Quantitearticle: ""
                });
        
                if (oDialog) {
                    this.getView().addDependent(oDialog);
                    oDialog.open();
                }
            });
        },
        // Fermer le Dialog
        onCancelArticleDialog: function () {
            this.getView().byId("addArticleDialog").close();
        },

  
        onSaveArticle: function () {
            var oFormModel = this.getView().getModel("newArticle");
            var oData = oFormModel.getData();
        
            if (!oData.Idarticle || !oData.Nomarticle) {
                MessageBox.warning("Les champs obligatoires doivent être remplis.");
                return;
            }
        
            var oDialog = this.byId("addArticleDialog");
            var oModel = this._oODataModel;
        
            if (this._sSelectedPath) {
                // Update d'un article
                oModel.update(this._sSelectedPath, oData, {
                    success: function () {
                        MessageToast.show("Article mis à jour avec succès.");
                        oDialog.close();
                    },
                    error: function () {
                        MessageBox.error("Erreur lors de la mise à jour.");
                    }
                });
        
                this._sSelectedPath = null; // Reset après update
            } else {
                // Ajout d'un nouvel article
                oModel.create("/ZCDS_article", oData, {
                    success: function () {
                        MessageToast.show("Article ajouté avec succès.");
                        oDialog.close();
                    },
                    error: function () {
                        MessageBox.error("Erreur lors de l’ajout.");
                    }
                });
            }
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
        },
        onDeleteArticlePress: function () {
            const oSmartTable = this.getView().byId("smartTableArticle");
            const oTable = oSmartTable.getTable();
            const oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                MessageBox.warning("Veuillez sélectionner un article à supprimer.");
                return;
            }
        
            const oContext = oSelectedItem.getBindingContext();
            const sPath = oContext.getPath();
        
            MessageBox.confirm("Voulez-vous vraiment supprimer cet article ?", {
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        this._oODataModel.remove(sPath, {
                            success: () => {
                                MessageToast.show("Article supprimé avec succès.");
                                this._oODataModel.refresh();
                            },
                            error: () => {
                                MessageBox.error("Erreur lors de la suppression de l'article.");
                            }
                        });
                    }
                }
            });
        },
        onUpdateArticlePress: function () {
            // Récupérer la table et la ligne sélectionnée
            var oSmartTable = this.byId("smartTableArticle");
            var oTable = oSmartTable.getTable();
            var aSelectedItems = oTable.getSelectedItems(); // pour ResponsiveTable
        
            if (aSelectedItems.length === 0) {
                MessageToast.show("Veuillez sélectionner un article à modifier.");
                return;
            }
        
            // Récupérer les données de la ligne sélectionnée
            var oSelectedItem = aSelectedItems[0];
            var oContext = oSelectedItem.getBindingContext();
            var oData = oContext.getObject();
        
            // Remplir le modèle du formulaire
            var oFormModel = this.getView().getModel("newArticle");
            oFormModel.setData(Object.assign({}, oData)); // Cloner les données
        
            // Sauvegarder l'ID pour l'update
            this._sSelectedPath = oContext.getPath(); // exemple : "/0"
        
            // Ouvrir le dialog
            this.byId("addArticleDialog").open();
        },
        onCancelArticleDialog: function () {
            this.byId("addArticleDialog").close();
            this._sSelectedPath = null; // Réinitialiser en cas d'annulation
        },
        _generateNextIdArticle: function (callback) {
            var oModel = this._oODataModel;
        
            // Lire tous les articles pour trouver le plus grand ID
            oModel.read("/ZCDS_article", {
                success: function (oData) {
                    var aArticles = oData.results;
        
                    // Extraire les IDs numériques s’ils suivent un format ex: A0001, A0002
                    var maxId = 0;
                    aArticles.forEach(function (article) {
                        var match = article.Idarticle.match(/\d+$/); // extrait le numéro à la fin
                        if (match) {
                            var num = parseInt(match[0], 10);
                            if (num > maxId) {
                                maxId = num;
                            }
                        }
                    });
        
                    // Nouveau ID (ex: A0005 → A0006)
                    var nextId = String(maxId + 1);
        
                    // Appel callback avec le nouvel ID
                    callback(nextId);
                },
                error: function () {
                    MessageBox.error("Erreur lors de la génération de l'ID Article.");
                }
            });
        }
        
        
        
        
        

    });
});
