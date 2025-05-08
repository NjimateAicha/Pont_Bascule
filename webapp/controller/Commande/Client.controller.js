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
            var oSmartTable = this.getView().byId("smartTableClient");
            if (oSmartTable) {
                // Attendre que la table réelle soit disponible
                oSmartTable.attachInitialise(() => {
                    const oTable = oSmartTable.getTable();
                    // Si la table est une ResponsiveTable (sap.m.Table), utilise cette méthode
                    if (oTable.setMode) {
                        oTable.setMode("SingleSelectMaster"); // ou "MultiSelect"
                    }
                });
            }

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
            this._generateNextIdClient((nextId) => {
                // Injecter dans le modèle
                var oModel = this.getView().getModel("newClient");
                oModel.setData({
                    Idclient: nextId,
                    Nomclient: "",
                    Telephone: "",
                    Adresse: "",
                    Email: ""
                });
        
                if (oDialog) {
                    this.getView().addDependent(oDialog);
                    oDialog.open();
                }
            });
    },

        

        // Fermer le Dialog
        onCancelDialog: function () {
            this.getView().byId("addClientDialog").close();
        },

       
        onSaveClient: function () {
            var oModel = this._oODataModel;
            var oView = this.getView();
            var oNewClient = oView.getModel("newClient").getData();
            var oSmartTable = oView.byId("smartTableClient");
        
            // Validation des champs requis
            if (!oNewClient.Idclient || !oNewClient.Nomclient) {
                MessageBox.error("Veuillez remplir les champs obligatoires (ID Client et Nom).");
                return;
            }
        
            // Affiche le chargement
            sap.ui.core.BusyIndicator.show(0);
        
            // Vérifie si c'est une mise à jour ou une création
            if (this._sEditPath) {
                // MODE UPDATE
                oModel.update(this._sEditPath, oNewClient, {
                    success: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Client mis à jour avec succès.");
                        oView.byId("addClientDialog").close();
        
                        // Réinitialiser les champs
                        oView.getModel("newClient").setData({
                            Idclient: "",
                            Nomclient: "",
                            Telephone: "",
                            Adresse: "",
                            Email: ""
                        });
        
                        if (oSmartTable) {
                            oSmartTable.rebindTable();
                        }
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error("Erreur lors de la mise à jour du client.");
                    }
                });
        
                // Reset path
                this._sEditPath = null;
            } else {
                // MODE CREATE
                oModel.create("/ZCDS_Clientt", oNewClient, {
                    success: function () {
                        sap.ui.core.BusyIndicator.hide();
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
        
                        if (oSmartTable) {
                            oSmartTable.rebindTable();
                        }
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error("Erreur lors de l'ajout du client.");
                    }
                });
            }
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
        },
        // Suppression d'un client
        onDeleteClientPress: function () {
            var oSmartTable = this.getView().byId("smartTableClient");
            var oTable = oSmartTable.getTable(); 
            var oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                MessageBox.warning("Veuillez sélectionner un client à supprimer.");
                return;
            }
        
            var oContext = oSelectedItem.getBindingContext(); // contexte OData
            var sPath = oContext.getPath(); // ex: "/ZCDS_Clientt('0001')"
        
            MessageBox.confirm("Voulez-vous vraiment supprimer ce client ?", {
                title: "Confirmation de suppression",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        this._oODataModel.remove(sPath, {
                            success: function () {
                                MessageToast.show("Client supprimé avec succès.");
                                oSmartTable.rebindTable(); // rafraîchir les données
                            },
                            error: function () {
                                MessageBox.error("Erreur lors de la suppression du client.");
                            }
                        });
                    }
                }.bind(this) // très important : bind pour garder le bon "this"
            });
        },


        // Modification d'un client
        onEditClientPress: function () {
            var oSmartTable = this.getView().byId("smartTableClient");
            var oTable = oSmartTable.getTable();
            var oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                MessageBox.warning("Veuillez sélectionner un client à modifier.");
                return;
            }
        
            var oContext = oSelectedItem.getBindingContext();
            var oClientData = oContext.getObject();
        
            // Pré-remplir les champs du formulaire
            var oViewModel = this.getView().getModel("newClient");
            oViewModel.setData({
                Idclient: oClientData.Idclient,
                Nomclient: oClientData.Nomclient,
                Telephone: oClientData.Telephone,
                Adresse: oClientData.Adresse,
                Email: oClientData.Email
            });
        
            this._sEditPath = oContext.getPath(); // enregistrer le path pour l’update
            this.getView().byId("addClientDialog").open();
        },



        _generateNextIdClient: function (callback) {
            var oModel = this._oODataModel;
            oModel.read("/ZCDS_Clientt", {
           
                success: function (oData) {
                    var aclient = oData.results;
        
                    // Extraire les IDs numériques s’ils suivent un format ex: A0001, A0002
                    var maxId = 0;
                    aclient.forEach(function (client) {
                        var match = client.Idclient.match(/\d+$/); // extrait le numéro à la fin
                        if (match) {
                            var num = parseInt(match[0], 10);
                            if (num > maxId) {
                                maxId = num;
                            }
                        }
                    });
        
                    var nextId = String(maxId + 1);
        
                    // Appel callback avec le nouvel ID
                    callback(nextId);
                },
                error: function () {
                    MessageBox.error("Erreur lors de la récupération du dernier ID client.");
                }
            });
        }
        

        

    });
});
