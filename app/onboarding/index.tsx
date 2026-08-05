import { ScrollView } from 'react-native'
import { useState } from 'react'
import { theme } from '@/constants/theme'
import { Sex, Goal, ActivityLevel } from '@/types'
import Step1BasicInfo from '@/components/onboarding/Step1BasicInfo'
import Step2BodyStats from '@/components/onboarding/Step2BodyStats'
import Step3Goal from '@/components/onboarding/Step3Goal'
import Step4Activity from '@/components/onboarding/Step4Activity'
import Step5Results from '@/components/onboarding/Step5Results'

export default function OnboardingScreen() {
  const [step, setStep] = useState<number>(1)

  // Step 1 state
  const [name, setName] = useState<string>('')
  const [age, setAge] = useState<string>('')
  const [sex, setSex] = useState<Sex | null>(null)
  const [height, setHeight] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null)

  // Step 3 state
  const [goal, setGoal] = useState<Goal | null>(null)


  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ flexGrow: 1 }}>
      {step === 1 && (
        <Step1BasicInfo
          name={name}
          setName={setName}
          age={age}
          setAge={setAge}
          sex={sex}
          setSex={setSex}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2BodyStats
          height={height}
          setHeight={setHeight}
          weight={weight}
          setWeight={setWeight}
          heightUnit={heightUnit}
          setHeightUnit={setHeightUnit}
          weightUnit={weightUnit}
          setWeightUnit={setWeightUnit}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3Goal
          goal={goal}
          setGoal={setGoal}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Step4Activity
          activityLevel={activityLevel}
          setActivityLevel={setActivityLevel}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && sex && (
        <Step5Results
          name={name}
          age={age}
          sex={sex}
          height={height}
          weight={weight}
          heightUnit={heightUnit}
          weightUnit={weightUnit}
          goal={goal}
          activityLevel={activityLevel}
          onBack={() => setStep(4)}
        />
      )}
    </ScrollView>
  )

}