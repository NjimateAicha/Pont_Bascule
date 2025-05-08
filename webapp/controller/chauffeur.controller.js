sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageBox, MessageToast, History) {
    "use strict";

    return Controller.extend("projectsd.controller.chauffeur", {

        onInit: function () {
            // Modèle pour le formulaire d'ajout
            var oChauffeurModel = new JSONModel({
                Idchauffeur: "",
                Cin: "",
                Nomchauffeur: "",
                Telechauffeur: "",
                Idtransporter: "",
                Idvehicule: ""
            });
            this.getView().setModel(oChauffeurModel, "newchauffeur");

            // Récupération du modèle OData
            this._oODataModel = this.getOwnerComponent().getModel();

            // Configuration de la SmartTable
            this._setupSmartTable();
        },

        _setupSmartTable: function () {
            var oSmartTable = this.getView().byId("smartTableChauffeur");
            if (oSmartTable) {
                oSmartTable.setInitiallyVisibleFields("Idchauffeur,Cin,Nomchauffeur,Telechauffeur,Idtransporter,Idvehicule");
            }
        },

        onAddChauffeurPress: function () {
            // Réinitialise le modèle
            this.getView().getModel("newchauffeur").setData({
                Idchauffeur: "",
                Cin: "",
                Nomchauffeur: "",
                Telechauffeur: "",
                Idtransporter: "",
                Idvehicule: ""
            });

            this.getView().byId("addChauffeurDialog").open();
        },

        onCancelChauffeurDialog: function () {
            this.getView().byId("addChauffeurDialog").close();
        },

        onSaveChauffeur: function () {
            var oModel = this._oODataModel;
            var oNewChauffeur = this.getView().getModel("newchauffeur").getData();

            // Validation des champs obligatoires
            if (!oNewChauffeur.Idchauffeur || !oNewChauffeur.Cin) {
                MessageBox.warning("Les champs obligatoires ne sont pas remplis.");
                return;
            }

            // Création de l’entrée
            oModel.create("/zcds_chauffeur", oNewChauffeur, {
                success: function () {
                    MessageToast.show("Chauffeur ajouté avec succès !");
                },
                error: function (oError) {
                    MessageBox.error("Erreur lors de l'ajout du chauffeur.");
                    console.error("Erreur backend :", oError);
                }
            });

            this.getView().byId("addChauffeurDialog").close();
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteView1", {}, true);
            }
        }

    });
});
