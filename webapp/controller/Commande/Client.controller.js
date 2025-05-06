sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageBox, MessageToast, History) {
    "use strict";

    return Controller.extend("projectsd.controller.Commande.Client", {

        onInit: function () {
            // Modèle pour le formulaire de création d’un nouveau client
            var oClientModel = new JSONModel({
                Idclient: "",
                Nomclient: "",
                Telephone: "",
                Adresse: "",
                Email: ""
            });
            this.getView().setModel(oClientModel, "newClient");

            // Obtenir le modèle OData
            this._oODataModel = this.getOwnerComponent().getModel();

            // Configuration de la SmartTable si nécessaire
            this._setupSmartTable();
        },

        _setupSmartTable: function () {
            var oSmartTable = this.getView().byId("smartTableClient");
            if (oSmartTable) {
                // Optionnel : définir les champs visibles initialement
                oSmartTable.setInitiallyVisibleFields("Idclient,Nomclient,Telephone,Adresse,Email");
            }
        },

        // Ouvrir le Dialog
        onAddClientPress: function () {
          
            var oDialog = this.getView().byId("addClientDialog");
if (oDialog) {
    this.getView().addDependent(oDialog);
    oDialog.open();
} else {
    MessageBox.error("Erreur : le dialogue 'addClientDialog' est introuvable.");
}

        },
        

        // Fermer le Dialog
        onCancelDialog: function () {
            this.getView().byId("addClientDialog").close();
        },

        // Sauvegarder un nouveau client
        onSaveClient: function () {
            var oModel = this._oODataModel;
            var oView = this.getView();
            var oNewClient = oView.getModel("newClient").getData();

            // Validation des champs requis
            if (!oNewClient.Idclient || !oNewClient.Nomclient) {
                MessageBox.error("Veuillez remplir les champs obligatoires (ID Client et Nom).");
                return;
            }

            // Création dans l'OData
            oModel.create("/ZCDS_Clientt", oNewClient, {
                success: function () {
                    MessageToast.show("Client ajouté avec succès.");
                    oView.byId("addClientDialog").close();

                    // Réinitialiser les champs
                    oView.getModel("newClient").setData({
                        Idclient: "",
                        Nomclient: "",
                        Telephone: "",
                        Adresse: "",
                        Email: ""
                    });

                    // Rafraîchir la table si nécessaire
                    var oSmartTable = oView.byId("smartTableClient");
                    if (oSmartTable) {
                        oSmartTable.rebindTable();
                    }
                },
                error: function (oError) {
                    MessageBox.error("Erreur lors de l'ajout du client.");
                }
            });
        },

        // Validation téléphone
        validatePhone: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var regex = /^[0-9]{10,15}$/;
            var oInput = oEvent.getSource();

            if (!regex.test(sValue)) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Numéro invalide. Format attendu : 10 à 15 chiffres.");
            } else {
                oInput.setValueState("None");
            }
        },

        // Validation email
        validateEmail: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            var oInput = oEvent.getSource();

            if (!regex.test(sValue)) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Adresse email invalide.");
            } else {
                oInput.setValueState("None");
            }
        },

        // Bouton de retour
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                // Redirection par défaut
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteAccueil", {}, true);
            }
        }

    });
});
