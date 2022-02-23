import React, { useContext, useState } from 'react'
import { UserContext } from '../../context/UserManager'
import useRequest from '../../state/useRequest'
import moment from 'moment'
import { Link, useHistory } from 'react-router-dom'
import { TeamContext } from '../../context/TeamManager'
import { updateUser } from '../../api/user'

type Props = {
  inferenceId?: string;
  serviceId: string;
}

const Congrats: React.FC<Props> = ({ inferenceId, serviceId }) => {
  const { user } = useContext(UserContext)
  const { team } = useContext(TeamContext)
  const { request: inference } = useRequest(inferenceId)
  const history = useHistory()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  //const diff = moment(user.createdAt).subtract(inference.createdAt).toString()

  if(!inference?.id) {
    return <div></div>
  }

  const onConclude = async () => {
    setIsLoading(true)
    const url = `/team/${team.id}/model/${serviceId}/monitoring`

    await updateUser({
      onboardingState: {
        completedAt: new Date()
      }
    })

    history.push(url)
  }

  return (
    <div className='shadow mt-2 p-4 bg-white rounded'>
      <h1 className='mb-2'>🎉 Whoo, Congrats!</h1>

      <p className='text-gray-800'>You deployed your first model and made an inference. Now let's look at the dashboard:</p>

      <div onClick={onConclude} className={`px-2 py-1 cursor-pointer hover:bg-blue-400 transition-all bg-blue-500 rounded text-white mt-2 inline-block ${isLoading && 'opacity-50'}`}>{ isLoading ? 'Redirecting ..' : 'Go to Dashboard' }</div>
    </div>
  )
}

export default Congrats