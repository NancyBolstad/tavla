import { https, firestore as firestoreDB, region } from 'firebase-functions'
import { firestore, auth, initializeApp, storage } from 'firebase-admin'

initializeApp()

export const getImageUploadToken = https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new https.HttpsError(
            'failed-precondition',
            'The function must be called while authenticated.',
        )
    }

    if (typeof data.imageUid !== 'string') {
        throw new https.HttpsError(
            'invalid-argument',
            'Image UID must be a string.',
        )
    }

    const doc = await firestore()
        .collection('settings')
        .doc(data.imageUid)
        .get()

    if (!doc.exists) {
        throw new https.HttpsError(
            'invalid-argument',
            'Image UID must refer to an existing settings document.',
        )
    }

    const documentData = doc.data()

    if (
        !documentData ||
        (documentData.owners.length > 0 &&
            !documentData.owners.includes(context.auth.uid))
    ) {
        throw new https.HttpsError(
            'permission-denied',
            'Account running function must have access to settings document.',
        )
    }

    const metadata = {
        uploadUid: doc.exists && data.imageUid,
    }

    const uploadToken = await auth().createCustomToken(
        context.auth.uid,
        metadata,
    )

    return { uploadToken }
})

export const deleteImagefromStorage = firestoreDB
    .document('settings/{settingsID}')
    .onUpdate(async (change, context) => {
        if (change.before.data().logo && !change.after.data().logo) {
            try {
                const path = `images/${context.params.settingsID}`
                await storage().bucket().file(path).delete()
            } catch (error) {
                console.error(error)
                throw error
            }
        }
    })

export const scheduledDeleteOfDocumentsSetToBeDeleted = region('us-central1')
    .pubsub.schedule('every day 04:00')
    .timeZone('Europe/Oslo')
    .onRun(() => {
        try {
            const batch = firestore().batch()
            firestore()
                .collection('settings')
                .where('delete', '==', true)
                .get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        batch.delete(doc.ref)
                    })
                    console.log(
                        querySnapshot.size +
                            ' documents set to be batch deleted.',
                    )
                    return batch.commit()
                })
                .then(() => console.log('Successfull delete of batch.'))
        } catch (error) {
            console.error(error)
        }
        return null
    })
