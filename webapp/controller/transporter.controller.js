sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageBox, MessageToast, History)  {
    "use strict";

    return Controller.extend("projectsd.controller.transportter", {

        onInit: function () {
            // Modèle pour le formulaire de création d’un nouveau transporter

           
            
            var oTransporterModel = new JSONModel({
                // Idtransporteur: "",
                Nomtransporteur: "",
                Telephonetansporter: "",
                Adressetansporter: "",
                Type: ""
            });
            this.getView().setModel(oTransporterModel, "newtransporter");

            // Obtenir le modèle OData
            this._oODataModel = this.getOwnerComponent().getModel();
            var oSmartTable = this.byId("smartTabletrasporter");
            

            // Configuration de la SmartTable si nécessaire
            this._setupSmartTable();
            oSmartTable.attachInitialise(() => {
                const oTable = oSmartTable.getTable();
                
                // Si la table est une ResponsiveTable (sap.m.Table), utilise cette méthode
                if (oTable.setMode) {
                  oTable.setMode("SingleSelectMaster"); // ou "MultiSelect"
                }
              });
                        
        },
           // Handle row selection change
           onRowSelectionChange: function (oEvent) {
            var oTable = oEvent.getSource();
            var oView = this.getView();

            // Get selected contexts (ensure only one is selected for edit/delete)
            var aSelectedContexts = oTable.getSelectedContexts();

            // Enable/disable the Edit and Delete buttons based on selection
            var oEditButton = oView.byId("editTransporterBtn");
            var oDeleteButton = oView.byId("deleteTransporterBtn");
            console.log("aaaa");

            if (aSelectedContexts.length === 1) {
                oEditButton.setEnabled(true);
                oDeleteButton.setEnabled(true);
                console.log("aaaa");
            } else {
                oEditButton.setEnabled(false);
                oDeleteButton.setEnabled(false);
            }
        },

        


        onTypeChange: function (oEvent) {
            var selectedKey = oEvent.getSource().getSelectedKey();
            var oView = this.getView();
            var oModel = oView.getModel("newtransporter");
        
            var bIsClient = selectedKey === "client";
            var bIsIntern = selectedKey === "intern";
        
            // Show or hide the client ID field
            oView.byId("clientIdLabel").setVisible(bIsClient);
            oView.byId("clientIdComboBox").setVisible(false);
            oView.byId("clientNameComboBox").setVisible(bIsClient);
            oView.byId("clientIdLabel4").setVisible(bIsClient);
            oView.byId("_IDGenInput1").setVisible(!bIsClient);

            if (bIsClient) {
                // Clear transporter info in case it was filled before
                oModel.setProperty("/Nomtransporteur", "");
                oModel.setProperty("/Telephonetansporter", "");
                oModel.setProperty("/Adressetansporter", "");
            } else {
                // Clear Idclient to avoid retaining previous selection
                oModel.setProperty("/Idclient", "");
        
                if (bIsIntern) {
                    oModel.setProperty("/Nomtransporteur", "Sofalim");
                    oModel.setProperty("/Telephonetansporter", "0123456789");
                    oModel.setProperty("/Adressetansporter", "10 rue de Sofalim, Casablanca");
                } else {
                    // Extern or any other type
                    oModel.setProperty("/Nomtransporteur", "");
                    oModel.setProperty("/Telephonetansporter", "");
                    oModel.setProperty("/Adressetansporter", "");
                }
            }
        },
        onDeleteTransporterPress: function () {
            const oSmartTable = this.getView().byId("smartTabletrasporter");
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








        onEditTransporter: function () {
            var oTable = this.byId("smartTabletrasporter").getTable();
            var aSelectedContexts = oTable.getSelectedContexts();

            if (aSelectedContexts.length === 0) return;

            var oData = aSelectedContexts[0].getObject();

            // Populate the "newtransporter" model with the selected transporter data
            this.getView().getModel("newtransporter").setData(Object.assign({}, oData));

            // Open the same dialog for editing
            this.byId("addTransporterDialog").open();

            // Mark that it's an edit mode (handle on save)
            this._bEditMode = true;
            this._sEditPath = aSelectedContexts[0].getPath();
        },

        onEditTransporterPress: function () {
            var oSmartTable = this.getView().byId("smartTabletrasporter");
            var oTable = oSmartTable.getTable();
            var oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                MessageBox.warning("Veuillez sélectionner un transporteur à modifier.");
                return;
            }
        
            var oContext = oSelectedItem.getBindingContext();
            var oTransporterData = oContext.getObject();
        
            var oViewModel = this.getView().getModel("newtransporter");
            oViewModel.setData({
                Idclient: oTransporterData.Idclient || "",
                Nomtransporteur: oTransporterData.Nomtransporteur,
                Telephonetansporter: oTransporterData.Telephonetansporter,
                Adressetansporter: oTransporterData.Adressetansporter,
                Type: oTransporterData.Type
            });
        
            // Afficher ou masquer les champs client
            // this.getView().byId("clientIdLabel").setVisible(oTransporterData.Type === "client");
            // this.getView().byId("clientIdComboBox").setVisible(oTransporterData.Type === "client");
        
            this.getView().byId("clientIdLabel").setVisible(false);
            this.getView().byId("clientIdComboBox").setVisible(false);
        

            // Stocker les infos nécessaires pour l'update
            this._bEditMode = true;
            this._sEditPath = oContext.getPath();
        
            // Ouvre le dialog
            this.getView().byId("addTransporterDialog").open();
        },
        
        
        

        onClientSelected: function (oEvent) {
            var sSelectedClientId = oEvent.getParameter("selectedItem").getKey();
            var oView = this.getView();
            var oModel = this._oODataModel;
            var oFormModel = oView.getModel("newtransporter");
        
            // Récupère les données du client depuis la CDS OData
            oModel.read("/ZCDS_Clientt('" + sSelectedClientId + "')", {
                success: function (oData) {
                    oFormModel.setProperty("/Nomtransporteur", oData.Nomclient);
                    oFormModel.setProperty("/Telephonetansporter", oData.Telephoneclient);
                    oFormModel.setProperty("/Adressetansporter", oData.Adresseclient);
                },
                error: function () {
                    sap.m.MessageBox.error("Impossible de charger les données du client.");
                }
            });
        },
        
        

        _setupSmartTable: function () {
            var oSmartTable = this.getView().byId("smartTabletrasporter");
            if (oSmartTable) {
                // Optionnel : définir les champs visibles initialement
                oSmartTable.setInitiallyVisibleFields("Nomtransporteur,Telephonetansporter,Adressetansporter,Type");
            }
        },



        onAddTransporterPress: function () {
            // Réinitialise le modèle avec des données vides
            this.getView().getModel("newtransporter").setData({
                Idclient: "",
                Nomtransporteur: "",
                Telephonetansporter: "",
                Adressetansporter: "",
                Type: ""
            });
        
            // Désactive le mode édition
            this._bEditMode = false;
            this._sEditPath = null;
        
            // Ouvre le dialog
            this.getView().byId("addTransporterDialog").open();
        }
        ,
        
        onCancelTransporterDialog: function () {
            // Réinitialise également les indicateurs de mode édition
            this._bEditMode = false;
            this._sEditPath = null;
        
            this.getView().byId("addTransporterDialog").close();
        },
        
        
        onClientSelected: function (oEvent) {
            var sSelectedClientId = oEvent.getParameter("selectedItem").getKey();
            var oModel = this._oODataModel;
            var oFormModel = this.getView().getModel("newtransporter");
        
            if (!sSelectedClientId) {
                return;
            }
        
            oModel.read("/ZCDS_Clientt('" + sSelectedClientId + "')", {
                success: function (oData) {
                    oFormModel.setProperty("/Nomtransporteur", oData.Nomclient);
                    oFormModel.setProperty("/Telephonetansporter", oData.Telephone);
                    oFormModel.setProperty("/Adressetansporter", oData.Adresse);
                    oFormModel.setProperty("/Idclient", oData.Idclient);
                },
                error: function () {
                    MessageBox.error("Erreur lors du chargement des informations client.");
                }
            });
        },
        
        onSaveTransporter: function () {
            var oModel = this._oODataModel;
            var oData = this.getView().getModel("newtransporter").getData();
            var bEdit = this._bEditMode;
            var sPath = this._sEditPath;
        



             // ✅ Vérification du format du téléphone
    var sPhone = oData.Telephonetansporter;
    var oPhoneRegex = /^06\d{8}$/;  // commence par 06 suivi de 8 chiffres

    if (!oPhoneRegex.test(sPhone)) {
        MessageBox.error("Le numéro de téléphone n'est pas valide.");
        return; // Stop save process
    }



            if (bEdit && sPath) {
                // Mode modification
                oModel.update(sPath, oData, {
                    success: function () {
                        MessageToast.show("Transporteur modifié avec succès !");
                    },
                    error: function () {
                        MessageBox.error("Erreur lors de la modification.");
                    }
                });
            } else {
                // Mode création
                oModel.create("/zcds_transporter", oData, {
                    success: function () {
                        MessageToast.show("Transporteur ajouté avec succès !");
                    },
                    error: function () {
                        MessageBox.error("Erreur lors de l'ajout.");
                    }
                });
            }
        
            // Fermer le dialog
            this.getView().byId("addTransporterDialog").close();
        
            // Réinitialiser les états
            this._bEditMode = false;
            this._sEditPath = null;
        
            // Vider le modèle
            this.getView().getModel("newtransporter").setData({
                Idclient: "",
                Nomtransporteur: "",
                Telephonetansporter: "",
                Adressetansporter: "",
                Type: ""
            });
        }
        
        

     
    });
});
